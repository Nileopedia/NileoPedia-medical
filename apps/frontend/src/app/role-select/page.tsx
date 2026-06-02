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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-2xl">
        <div className="flex items-center mb-8">
          <Link href="/login" className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
            <ArrowLeft size={18} />
            Back to Login
          </Link>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Select Your Role</h1>
          <p className="text-slate-600 dark:text-slate-400">Choose the role that best describes your work</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => handleSelectRole(role.id as Role)}
              className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md transition-all group"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${role.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <role.icon size={24} className="text-white" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">{role.label}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{role.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}