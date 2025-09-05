import { db } from '../lib/db';
import { users, userRoles, UserRole } from '../lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');
  
  try {
    const database = db();
    // Create 2 of each type of user account
    const userSeeds = [
      // 2 Admins
      { email: 'admin1@aft.gov', firstName: 'Alice', lastName: 'Admin', role: UserRole.ADMIN, organization: 'AFT System' },
      { email: 'admin2@aft.gov', firstName: 'Bob', lastName: 'Administrator', role: UserRole.ADMIN, organization: 'AFT System' },
      
      // 2 Requestors
      { email: 'requester1@contractor.com', firstName: 'Charlie', lastName: 'Requester', role: UserRole.REQUESTOR, organization: 'ABC Contractor Inc' },
      { email: 'requester2@contractor.com', firstName: 'Diana', lastName: 'RequestMaker', role: UserRole.REQUESTOR, organization: 'XYZ Defense Corp' },
      
      // 2 DAOs
      { email: 'dao1@aft.gov', firstName: 'Edward', lastName: 'Authorizer', role: UserRole.DAO, organization: 'AFT Security' },
      { email: 'dao2@aft.gov', firstName: 'Fiona', lastName: 'Official', role: UserRole.DAO, organization: 'AFT Operations' },
      
      // 2 Approvers
      { email: 'approver1@aft.gov', firstName: 'George', lastName: 'SecurityMgr', role: UserRole.APPROVER, organization: 'AFT InfoSec' },
      { email: 'approver2@aft.gov', firstName: 'Helen', lastName: 'InfoSecOfficer', role: UserRole.APPROVER, organization: 'AFT Cyber' },
      
      // 2 CPSOs
      { email: 'cpso1@aft.gov', firstName: 'Ian', lastName: 'ContractorSec', role: UserRole.CPSO, organization: 'AFT Security' },
      { email: 'cpso2@aft.gov', firstName: 'Jane', lastName: 'ProgramSec', role: UserRole.CPSO, organization: 'AFT Oversight' },
      
      // 2 DTAs
      { email: 'dta1@aft.gov', firstName: 'Kevin', lastName: 'TransferAgent', role: UserRole.DTA, organization: 'AFT Data' },
      { email: 'dta2@aft.gov', firstName: 'Laura', lastName: 'DataAgent', role: UserRole.DTA, organization: 'AFT Transfer' },
      
      // 2 SMEs
      { email: 'sme1@aft.gov', firstName: 'Mark', lastName: 'Subject', role: UserRole.SME, organization: 'AFT Technical' },
      { email: 'sme2@aft.gov', firstName: 'Nancy', lastName: 'Expert', role: UserRole.SME, organization: 'AFT Analysis' },
      
      // 2 Media Custodians
      { email: 'custodian1@aft.gov', firstName: 'Oliver', lastName: 'MediaKeeper', role: UserRole.MEDIA_CUSTODIAN, organization: 'AFT Storage' },
      { email: 'custodian2@aft.gov', firstName: 'Patricia', lastName: 'DataCustodian', role: UserRole.MEDIA_CUSTODIAN, organization: 'AFT Archive' }
    ];

    for (const userData of userSeeds) {
      // Check if user already exists
      const existingUser = await database.select().from(users).where(eq(users.email, userData.email)).limit(1);
      
      if (existingUser.length > 0) {
        console.log(`⚠️  User already exists: ${userData.email}`);
        continue;
      }

      const hashedPassword = await bcrypt.hash('apples@@22', 12);
      
      const [newUser] = await database.insert(users).values({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        primaryRole: userData.role,
        organization: userData.organization,
        password: hashedPassword,
        phone: '555-0123',
        isActive: true,
      }).returning();

      // Add primary role to user_roles table
      await database.insert(userRoles).values({
        userId: newUser.id,
        role: userData.role,
        isActive: true,
        assignedBy: newUser.id, // Self-assigned for initial setup
        createdAt: new Date(),
      });
      
      console.log(`✓ Created ${userData.role}: ${userData.email}`);
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log(`📊 Created ${userSeeds.length} users across ${Object.keys(UserRole).length} roles`);
    console.log('🔑 All users have password: apples@@22');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { seedDatabase };