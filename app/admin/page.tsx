'use client';

import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileText, Users, Shield, Settings } from 'lucide-react';
import { UserManagement } from '@/app/admin/user-management';
import { AdminRequestsView } from '@/app/admin/admin-requests-view';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function AdminContent() {
  const searchParams = useSearchParams();
  const section = searchParams.get('section') || 'overview';

  const renderContent = () => {
    switch (section) {
      case 'user-management':
        return <UserManagement />;
      case 'admin-requests':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  All AFT Requests
                </CardTitle>
                <CardDescription>
                  View and manage all Assured File Transfer requests in the system
                </CardDescription>
              </CardHeader>
            </Card>
            <AdminRequestsView />
          </div>
        );
      case 'system':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                System Settings
              </CardTitle>
              <CardDescription>
                Configure system-wide settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">System settings functionality coming soon.</p>
            </CardContent>
          </Card>
        );
      default:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Admin Dashboard
                </CardTitle>
                <CardDescription>
                  AFT System Administration Overview
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="w-5 h-5" />
                    All Requests
                  </CardTitle>
                  <CardDescription>
                    View and manage all AFT requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    Monitor and manage all file transfer requests in the system
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="w-5 h-5" />
                    User Management
                  </CardTitle>
                  <CardDescription>
                    Manage users and permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    Create, edit, and manage user accounts and access levels
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Settings className="w-5 h-5" />
                    System Settings
                  </CardTitle>
                  <CardDescription>
                    Configure system settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    Adjust system-wide configurations and preferences
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  return <div className="space-y-6">{renderContent()}</div>;
}

export default function AdminPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <AdminContent />
    </Suspense>
  );
}