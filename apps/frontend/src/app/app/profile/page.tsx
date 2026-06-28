'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { AppLayout } from '@/components/layout/AppLayout';
import { Avatar } from '@/components/ui/Avatar';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/utils/cn';

const roleLabels = {
  user: 'Medical User',
  validator: 'Validator',
  admin: 'Admin',
};

const roleColors = {
  user: 'bg-blue-100 text-blue-700',
  validator: 'bg-amber-100 text-amber-700',
  admin: 'bg-purple-100 text-purple-700',
};

export default function ProfilePage() {
  const { user } = useAppStore();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
      });
    }
  }, [user]);

  if (!user) {
    return <AppLayout><div className="p-4 sm:p-6 text-sm sm:text-base">Loading...</div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6 max-w-2xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your account information</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm sm:text-base">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <Avatar name={user.name} size="lg" />
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-foreground">{user.name}</h2>
                <span
                  className={cn(
                    'inline-block text-xs px-2 py-0.5 rounded-full mt-1 font-medium',
                    roleColors[user.role]
                  )}
                >
                  {roleLabels[user.role]}
                </span>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-foreground mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!editing}
                  className="w-full px-3 py-2 border border-border rounded-lg text-xs sm:text-sm bg-input disabled:bg-muted disabled:text-muted-foreground"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-foreground mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!editing}
                  className="w-full px-3 py-2 border border-border rounded-lg text-xs sm:text-sm bg-input disabled:bg-muted disabled:text-muted-foreground"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-foreground mb-1">Role</label>
                <p className="text-xs sm:text-sm text-muted-foreground">{roleLabels[user.role]}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-3 sm:pt-4">
              {editing ? (
                <>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setFormData({ name: user.name, email: user.email });
                    }}
                    className="px-4 py-2 text-xs sm:text-sm text-muted-foreground border border-border rounded-lg hover:bg-muted w-full sm:w-auto"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      // Would save to API here
                    }}
                    className="px-4 py-2 text-xs sm:text-sm text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 w-full sm:w-auto"
                  >
                    Save changes
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 text-xs sm:text-sm text-primary border border-primary/30 rounded-lg hover:bg-primary/10 w-full sm:w-auto"
                >
                  Edit profile
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}