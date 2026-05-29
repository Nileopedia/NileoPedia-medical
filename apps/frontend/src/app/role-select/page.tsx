'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { User, ClipboardCheck, Shield, BookOpen } from 'lucide-react';

export default function RoleSelect() {
  const roles = [
    { id: 'user', label: 'Medical User', description: 'Ask questions and get evidence-based answers', icon: <User size={32} />, path: '/app' },
    { id: 'validator', label: 'Medical Validator', description: 'Review and validate AI responses', icon: <ClipboardCheck size={32} />, path: '/app/validator' },
    { id: 'admin', label: 'Administrator', description: 'Manage system and users', icon: <Shield size={32} />, path: '/app/admin' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-950">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <BookOpen size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Select Your Role</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Choose how you want to use NileoPedia</p>
        </div>

        <div className="space-y-3">
          {roles.map((role) => (
            <Link key={role.id} href={role.path} className="block">
              <motion.div whileHover={{ scale: 1.02 }} className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600">
                    {role.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-50">{role.label}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{role.description}</p>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}