import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// User roles enum
export const UserRole = {
  ADMIN: 'admin',
  REQUESTOR: 'requestor',
  DAO: 'dao', // Designated Authorizing Official
  APPROVER: 'approver', // Information System Security Manager/Officer (renamed from ISSM)
  CPSO: 'cpso', // Contractor Program Security Officer
  DTA: 'dta', // Data Transfer Agent
  SME: 'sme', // Subject Matter Expert
  MEDIA_CUSTODIAN: 'media_custodian'
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

// AFT Status enum
export const AFTStatus = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  PENDING_DAO: 'pending_dao', // Waiting for DAO approval (HIGH-to-LOW only)
  PENDING_APPROVER: 'pending_approver', // Waiting for Approver approval (formerly ISSM)
  PENDING_CPSO: 'pending_cpso', // Waiting for CPSO approval
  APPROVED: 'approved', // All required approvals complete
  REJECTED: 'rejected',
  PENDING_DTA: 'pending_dta', // Waiting for DTA coordination
  ACTIVE_TRANSFER: 'active_transfer', // DTA performing Section IV processing
  PENDING_SME_SIGNATURE: 'pending_sme_signature', // Waiting for SME signature after DTA completion
  PENDING_SME: 'pending_sme', // Waiting for SME signature
  PENDING_MEDIA_CUSTODIAN: 'pending_media_custodian', // Waiting for Media Custodian
  COMPLETED: 'completed',
  DISPOSED: 'disposed', // Media custodian has completed final disposition
  CANCELLED: 'cancelled'
} as const;

export type AFTStatusType = typeof AFTStatus[keyof typeof AFTStatus];

// Users table
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  primaryRole: text('primary_role').notNull().$type<UserRoleType>(), // Primary role for permissions
  organization: text('organization'),
  phone: text('phone'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// User Roles junction table - supports multiple roles per user
export const userRoles = sqliteTable('user_roles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: text('role').notNull().$type<UserRoleType>(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  assignedBy: integer('assigned_by').references(() => users.id), // Who assigned this role
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Drive Inventory - Master list of all external drives
export const driveInventory = sqliteTable('drive_inventory', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  serialNumber: text('serial_number').notNull().unique(),
  model: text('model').notNull(),
  capacity: text('capacity').notNull(), // e.g., "1TB", "500GB"
  mediaController: text('media_controller').notNull(), // e.g., "MC-001", "MC-002"
  classification: text('classification').notNull(), // UNCLASSIFIED, SECRET, etc.
  status: text('status').notNull().default('available'), // available, issued, maintenance, retired
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// AFT Requests table - Main request information
export const aftRequests = sqliteTable('aft_requests', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  requestNumber: text('request_number').notNull().unique(),
  requestorId: integer('requestor_id').notNull().references(() => users.id),
  approverId: integer('approver_id').references(() => users.id),
  // Chain of Custody - Assigned users for each role
  dtaId: integer('dta_id').references(() => users.id), // Data Transfer Agent
  smeId: integer('sme_id').references(() => users.id), // Subject Matter Expert
  mediaCustodianId: integer('media_custodian_id').references(() => users.id), // Media Custodian
  
  // TPI is required for all AFT requests
  tpiRequired: integer('tpi_required', { mode: 'boolean' }).notNull().default(true),
  
  status: text('status').notNull().$type<AFTStatusType>().default(AFTStatus.DRAFT),
  
  // Section 1: General Information
  requestorName: text('requestor_name').notNull(),
  requestorOrg: text('requestor_org').notNull(),
  requestorPhone: text('requestor_phone').notNull(),
  requestorEmail: text('requestor_email').notNull(),
  
  // Section 2: Request Details
  transferPurpose: text('transfer_purpose').notNull(),
  transferType: text('transfer_type').notNull(), // inbound/outbound
  classification: text('classification').notNull(),
  caveatInfo: text('caveat_info'),
  dataDescription: text('data_description').notNull(),
  
  // Section 3: Source Information
  sourceSystem: text('source_system'),
  sourceLocation: text('source_location'),
  sourceContact: text('source_contact'),
  sourcePhone: text('source_phone'),
  sourceEmail: text('source_email'),
  
  // Section 4: Destination Information
  destSystem: text('dest_system'),
  destLocation: text('dest_location'),
  destContact: text('dest_contact'),
  destPhone: text('dest_phone'),
  destEmail: text('dest_email'),
  
  // Section 5: Technical Details
  dataFormat: text('data_format'),
  dataSize: text('data_size'),
  transferMethod: text('transfer_method'),
  encryption: text('encryption'),
  compressionRequired: integer('compression_required', { mode: 'boolean' }),
  
  // Drive Selection (optional - for external media transfers)
  selectedDriveId: integer('selected_drive_id').references(() => driveInventory.id),
  
  // Section 6: Schedule
  requestedStartDate: integer('requested_start_date', { mode: 'timestamp' }),
  requestedEndDate: integer('requested_end_date', { mode: 'timestamp' }),
  urgencyLevel: text('urgency_level'),
  
  // Section 7: Transfer Completion (DTA fills this)
  actualStartDate: integer('actual_start_date', { mode: 'timestamp' }),
  actualEndDate: integer('actual_end_date', { mode: 'timestamp' }),
  transferNotes: text('transfer_notes'),
  transferData: text('transfer_data'), // JSON string containing transfer completion details
  verificationType: text('verification_type'),
  verificationResults: text('verification_results'),
  
  // Approval information
  approvalDate: integer('approval_date', { mode: 'timestamp' }),
  approvalNotes: text('approval_notes'),
  approvalData: text('approval_data'), // JSON string containing approval signatures and details
  rejectionReason: text('rejection_reason'),
  
  // System fields
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// File attachments table
export const aftAttachments = sqliteTable('aft_attachments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  requestId: integer('request_id').notNull().references(() => aftRequests.id, { onDelete: 'cascade' }),
  fileName: text('file_name').notNull(),
  originalName: text('original_name').notNull(),
  fileSize: integer('file_size').notNull(),
  mimeType: text('mime_type').notNull(),
  filePath: text('file_path').notNull(),
  checksum: text('checksum'),
  uploadedBy: integer('uploaded_by').notNull().references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Audit log table for tracking changes
export const aftAuditLog = sqliteTable('aft_audit_log', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  requestId: integer('request_id').notNull().references(() => aftRequests.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id),
  action: text('action').notNull(), // created, updated, approved, rejected, etc.
  oldStatus: text('old_status'),
  newStatus: text('new_status'),
  changes: text('changes'), // JSON string of changed fields
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Drive Issue/Return Tracking
export const driveTracking = sqliteTable('drive_tracking', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  driveId: integer('drive_id').notNull().references(() => driveInventory.id),
  userId: integer('user_id').notNull().references(() => users.id), // Who has the drive
  custodianId: integer('custodian_id').notNull().references(() => users.id), // Who issued it
  sourceIS: text('source_is').notNull(), // Source Information System
  destinationIS: text('destination_is').notNull(), // Destination Information System
  issuedAt: integer('issued_at', { mode: 'timestamp' }).notNull(),
  expectedReturnAt: integer('expected_return_at', { mode: 'timestamp' }), // Optional expected return date
  returnedAt: integer('returned_at', { mode: 'timestamp' }), // NULL if not yet returned
  status: text('status').notNull().default('issued'), // issued, returned, overdue
  issueNotes: text('issue_notes'),
  returnNotes: text('return_notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertAftRequestSchema = createInsertSchema(aftRequests);
export const selectAftRequestSchema = createSelectSchema(aftRequests);
export const insertDriveInventorySchema = createInsertSchema(driveInventory);
export const selectDriveInventorySchema = createSelectSchema(driveInventory);
export const insertDriveTrackingSchema = createInsertSchema(driveTracking);
export const selectDriveTrackingSchema = createSelectSchema(driveTracking);

// Additional validation schemas
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  primaryRole: z.enum([UserRole.ADMIN, UserRole.REQUESTOR, UserRole.DAO, UserRole.APPROVER, UserRole.CPSO, UserRole.DTA, UserRole.SME, UserRole.MEDIA_CUSTODIAN]),
  additionalRoles: z.array(z.enum([UserRole.ADMIN, UserRole.REQUESTOR, UserRole.DAO, UserRole.APPROVER, UserRole.CPSO, UserRole.DTA, UserRole.SME, UserRole.MEDIA_CUSTODIAN])).optional(),
  organization: z.string().optional(),
  phone: z.string().optional(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type AFTRequest = typeof aftRequests.$inferSelect;
export type NewAFTRequest = typeof aftRequests.$inferInsert;
export type DriveInventory = typeof driveInventory.$inferSelect;
export type NewDriveInventory = typeof driveInventory.$inferInsert;
export type DriveTracking = typeof driveTracking.$inferSelect;
export type NewDriveTracking = typeof driveTracking.$inferInsert;