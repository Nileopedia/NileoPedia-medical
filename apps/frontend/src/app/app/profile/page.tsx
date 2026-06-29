'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { AppLayout } from '@/components/layout/AppLayout';
import { Avatar } from '@/components/ui/Avatar';
import { api } from '@/lib/api';
import { cn } from '@/utils/cn';
import { useToast } from '@/components/ui/Toast';

const roleLabels: Record<string, string> = {
  MEDICAL_USER: 'Medical User',
  VALIDATOR: 'Validator',
  ADMIN: 'Admin',
};

const roleColors: Record<string, string> = {
  MEDICAL_USER: 'bg-blue-100 text-blue-700',
  VALIDATOR: 'bg-amber-100 text-amber-700',
  ADMIN: 'bg-purple-100 text-purple-700',
};

export default function ProfilePage() {
  const [user, setUser] = useState<{ id: string; name: string; email: string; role: string; avatar?: string; createdAt?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    specialty: '',
    bio: '',
  });
  const { addToast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await api.request<{ success: boolean; data: { id: string; fullName: string; email: string; role: string; specialization?: string; institution?: string; profileImage?: string; createdAt?: string } }>('/users/me');
      const backendUser = response.data;
      setUser({
        id: backendUser.id,
        name: backendUser.fullName,
        email: backendUser.email,
        role: backendUser.role,
        avatar: backendUser.profileImage,
        createdAt: backendUser.createdAt,
      });
      setFormData({
        name: backendUser.fullName || '',
        email: backendUser.email || '',
        specialty: backendUser.specialization || '',
        bio: backendUser.institution || '',
      });
    } catch (err) {
      if ((err as Error).message === 'Please sign in to continue') {
        window.location.href = '/login';
      } else {
        addToast({ type: 'error', title: 'Failed to load profile' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const updatedUser = await api.request<{ success: boolean; data: { id: string; fullName: string; email: string; role: string; profileImage?: string } }>('/users/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          fullName: formData.name,
          email: formData.email,
          specialization: formData.specialty,
          institution: formData.bio,
        }),
      });
      setUser({ ...user!, name: updatedUser.data.fullName, email: updatedUser.data.email });
      setEditing(false);
      addToast({ type: 'success', title: 'Profile updated successfully' });
    } catch {
      addToast({ type: 'error', title: 'Failed to update profile' });
    }
  };

  const handlePasswordChange = async () => {
    const current = (document.getElementById('currentPassword') as HTMLInputElement)?.value;
    const newPass = (document.getElementById('newPassword') as HTMLInputElement)?.value;
    const confirm = (document.getElementById('confirmPassword') as HTMLInputElement)?.value;

    if (newPass !== confirm) {
      addToast({ type: 'error', title: 'Passwords do not match' });
      return;
    }

    try {
      await api.request('/users/change-password', {
        method: 'PATCH',
        body: JSON.stringify({ currentPassword: current, newPassword: newPass }),
      });
      addToast({ type: 'success', title: 'Password changed successfully' });
    } catch {
      addToast({ type: 'error', title: 'Failed to change password' });
    }
  };

  if (loading || !user) {
    return (
      <AppLayout>
        <div className="p-4 sm:p-6 text-sm sm:text-base">Loading...</div>
      </AppLayout>
    );
  }

  const roleKey = user.role.toUpperCase() === 'ADMIN' ? 'ADMIN' : user.role.toUpperCase() === 'VALIDATOR' ? 'VALIDATOR' : 'MEDICAL_USER';

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
              <Avatar name={user.name} size="lg" src={user.avatar} />
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-foreground">{user.name}</h2>
                <span
                  className={cn(
                    'inline-block text-xs px-2 py-0.5 rounded-full mt-1 font-medium',
                    roleColors[roleKey]
                  )}
                >
                  {roleLabels[roleKey]}
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
                <label className="block text-xs sm:text-sm font-medium text-foreground mb-1">Specialty</label>
                <input
                  type="text"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  disabled={!editing}
                  placeholder="Your medical specialty"
                  className="w-full px-3 py-2 border border-border rounded-lg text-xs sm:text-sm bg-input disabled:bg-muted disabled:text-muted-foreground"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-foreground mb-1">Bio / Institution</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  disabled={!editing}
                  placeholder="Your institution or bio"
                  className="w-full px-3 py-2 border border-border rounded-lg text-xs sm:text-sm bg-input disabled:bg-muted disabled:text-muted-foreground"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-foreground mb-1">Role</label>
                <p className="text-xs sm:text-sm text-muted-foreground">{roleLabels[roleKey]}</p>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-foreground mb-1">Joined</label>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-3 sm:pt-4">
              {editing ? (
                <>
                  <button
                    onClick={() => setEditing(false)}
                    className="px-4 py-2 text-xs sm:text-sm text-muted-foreground border border-border rounded-lg hover:bg-muted w-full sm:w-auto"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateProfile}
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

        <Card>
          <CardHeader>
            <CardTitle className="text-sm sm:text-base">Change Password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <input
              id="currentPassword"
              type="password"
              placeholder="Current password"
              className="w-full px-3 py-2 border border-border rounded-lg text-xs sm:text-sm bg-input"
            />
            <input
              id="newPassword"
              type="password"
              placeholder="New password"
              className="w-full px-3 py-2 border border-border rounded-lg text-xs sm:text-sm bg-input"
            />
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              className="w-full px-3 py-2 border border-border rounded-lg text-xs sm:text-sm bg-input"
            />
            <button
              onClick={handlePasswordChange}
              className="px-4 py-2 text-xs sm:text-sm text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 w-full sm:w-auto"
            >
              Update Password
            </button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}