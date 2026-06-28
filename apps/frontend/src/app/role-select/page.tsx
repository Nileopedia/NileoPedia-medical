'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Stethoscope, ClipboardCheck, Shield, ArrowLeft } from 'lucide-react';

type Role = 'user' | 'validator' | 'admin';

export default function RoleSelectPage() {
  const router = useRouter();

  const handleSelectRole = (role: Role) => {
    const roleMap: Record<Role, string> = {
      user: '/app',
      validator: '/validator',
      admin: '/admin',
    };
    router.push(roleMap[role]);
  };

  const roles = [
    { id: 'user', label: 'Medical User', icon: Stethoscope, color: 'from-blue-600 to-blue-700', description: 'Ask medical questions and get evidence-based answers' },
    { id: 'validator', label: 'Medical Validator', icon: ClipboardCheck, color: 'from-emerald-600 to-emerald-700', description: 'Review and validate AI-generated responses' },
    { id: 'admin', label: 'Admin', icon: Shield, color: 'from-purple-600 to-purple-700', description: 'Manage users, system settings, and analytics' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg sm:max-w-2xl">
        <div className="flex items-center mb-6 sm:mb-8">
          <Link href="/login" className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm">
            <ArrowLeft size={18} />
            Back to Login
          </Link>
        </div>
        
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">Select Your Role</h1>
          <p className="text-sm text-muted-foreground">Choose the role that best describes your work</p>
        </div>

        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => handleSelectRole(role.id as Role)}
              className="bg-card p-5 sm:p-6 rounded-xl border border-border hover:border-border hover:shadow-md transition-all group touch-target"
            >
              <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${role.color} rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform`}>
                <role.icon size={20} className="text-white sm:size-6" />
              </div>
              <h3 className="font-semibold text-foreground mb-1 sm:mb-2 text-sm sm:text-base">{role.label}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">{role.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}