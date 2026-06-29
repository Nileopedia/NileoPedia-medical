'use client';

import React, { useEffect, useState } from 'react';
import { Avatar } from '../../../components/ui/Avatar';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { User, Mail, BadgeCheck, Edit, Save, BarChart3, Clock } from 'lucide-react';
import { useAppStore } from '../../../store/appStore';
import { AppLayout } from '../../../components/layout/AppLayout';
import { api } from '../../../lib/api';
import { useToast } from '../../../components/ui/Toast';

interface ValidatorProfile {
  id: string;
  fullName: string;
  email: string;
  specialization?: string;
  institution?: string;
  bio?: string;
  experience?: string;
  reviewsCompleted: number;
  approvalRate: number;
  averageReviewTime: number;
}

export default function ValidatorProfilePage() {
  const { user } = useAppStore();
  const [profile, setProfile] = useState<ValidatorProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    specialization: '',
    institution: '',
    bio: '',
    experience: '',
  });
  const { addToast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.request<{ success: boolean; data: ValidatorProfile }>('/validator/profile');
      setProfile(response.data);
      setFormData({
        specialization: response.data.specialization || '',
        institution: response.data.institution || '',
        bio: response.data.bio || '',
        experience: response.data.experience || '',
      });
    } catch (err) {
      addToast({ type: 'error', title: 'Failed to load profile' });
    }
  };

  const handleSave = async () => {
    try {
      await api.request('/validator/profile', {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      addToast({ type: 'success', title: 'Profile updated' });
      setEditing(false);
      fetchProfile();
    } catch (err) {
      addToast({ type: 'error', title: 'Failed to update profile' });
    }
  };

  if (!profile) {
    return (
      <AppLayout>
        <div className="space-y-4 sm:space-y-6">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Profile</h1>
          <div className="text-center py-6 sm:py-8 text-sm">Loading profile...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Profile</h1>
            <p className="text-sm text-muted-foreground">Your validator account information</p>
          </div>
          <Button onClick={() => setEditing(!editing)} className="w-full sm:w-auto">
            {editing ? 'Cancel' : <><Edit size={16} className="mr-2" /> Edit Profile</>}
          </Button>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 p-4 sm:p-6 bg-card rounded-xl border border-border">
          <Avatar name={profile.fullName} size="lg" />
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-foreground">{profile.fullName}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
              <BadgeCheck size={16} className="text-emerald-600" />
              Verified Validator
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Mail size={18} className="text-blue-600" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2.5 sm:gap-4">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-muted-foreground" />
                <span className="text-foreground">{profile.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <User size={16} className="text-muted-foreground" />
                <span className="text-foreground">Role: validator</span>
              </div>
              {editing && (
                <>
                  <Input
                    placeholder="Specialization"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  />
                  <Input
                    placeholder="Institution"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  />
                  <Input
                    placeholder="Bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  />
                  <Input
                    placeholder="Experience"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  />
                </>
              )}
              {!editing && (
                <>
                  <p className="text-sm text-foreground">Specialization: {profile.specialization || '-'}</p>
                  <p className="text-sm text-foreground">Institution: {profile.institution || '-'}</p>
                  <p className="text-sm text-foreground">Bio: {profile.bio || '-'}</p>
                  <p className="text-sm text-foreground">Experience: {profile.experience || '-'}</p>
                </>
              )}
              {editing && (
                <Button onClick={handleSave} className="w-full sm:w-auto">
                  <Save size={16} className="mr-2" /> Save Changes
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm sm:text-base">Completed Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">{profile.reviewsCompleted}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm sm:text-base">Approval Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">{profile.approvalRate}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-1 text-sm sm:text-base">
                <Clock size={16} /> Avg Review Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">{profile.averageReviewTime}s</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}