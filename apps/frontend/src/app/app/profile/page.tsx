'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { TextArea } from '../../../components/ui/Input';
import { Camera, Save, Loader2, User } from 'lucide-react';
import { AppLayout } from '../../../components/layout/AppLayout';
import { api } from '../../../lib/api';
import { useAppStore } from '../../../store/appStore';
import { useRouter } from 'next/navigation';
import { useToast } from '../../../components/ui/Toast';
import { cn } from '../../../utils/cn';

type ProfileForm = {
  fullName: string;
  email: string;
  specialization: string;
  institution: string;
  bio: string;
  profileImage: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const user = useAppStore((state) => state.user);
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProfileForm>({
    fullName: '',
    email: '',
    specialization: '',
    institution: '',
    bio: '',
    profileImage: '',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const profile = await api.getCurrentUser();
      const initial: ProfileForm = {
        fullName: profile.name || '',
        email: profile.email || '',
        specialization: profile.specialty || '',
        institution: profile.title || '',
        bio: profile.bio || '',
        profileImage: profile.avatar || '',
      };
      setForm(initial);
      setImagePreview(profile.avatar || null);
    } catch (err) {
      if ((err as Error).message === 'Please sign in to continue') {
        router.push('/login');
      }
      addToast({ type: 'error', title: 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof ProfileForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      addToast({ type: 'error', title: 'Image must be under 5MB' });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setImagePreview(dataUrl);
      setForm((prev) => ({ ...prev, profileImage: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.updateProfile({
        fullName: form.fullName,
        email: form.email,
        specialization: form.specialization,
        institution: form.institution,
        bio: form.bio,
        profileImage: form.profileImage || undefined,
      });
      useAppStore.getState().setUser({
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        avatar: updated.avatar,
        title: updated.title,
        specialty: updated.specialty,
        bio: updated.bio,
        createdAt: updated.createdAt,
      });
      addToast({ type: 'success', title: 'Profile updated successfully' });
    } catch (err) {
      addToast({ type: 'error', title: (err as Error).message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your personal information</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Photo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div
                  onClick={handleImageClick}
                  className="relative h-24 w-24 sm:h-32 sm:w-32 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center cursor-pointer overflow-hidden hover:border-primary transition-colors"
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <User size={48} className="text-muted-foreground" />
                  )}
                  <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-1.5 rounded-full">
                    <Camera size={14} />
                  </div>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                <div>
                  <p className="text-sm font-medium text-foreground">Click to upload a photo</p>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF. Max 5MB</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
                  <Input value={form.fullName} onChange={handleChange('fullName')} placeholder="Your full name" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                  <Input type="email" value={form.email} onChange={handleChange('email')} placeholder="your@email.com" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Specialty</label>
                  <Input value={form.specialization} onChange={handleChange('specialization')} placeholder="e.g., Cardiology" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Institution</label>
                  <Input value={form.institution} onChange={handleChange('institution')} placeholder="e.g., City Hospital" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Bio</label>
                <TextArea rows={4} value={form.bio} onChange={handleChange('bio')} placeholder="Tell us about yourself..." />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
