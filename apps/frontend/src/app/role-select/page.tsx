'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function RoleSelectPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg w-full max-w-md"
      >
        <h1 className="text-3xl font-bold text-center text-slate-900 dark:text-slate-50 mb-6">Select Your Role</h1>
        <p className="text-center text-slate-600 dark:text-slate-400 mb-8">
          This is a placeholder for the role selection page.
          Please choose the role that best describes you.
        </p>
        <div className="space-y-4">
          {/* Role selection options would go here */}
          <button
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Medical User
          </button>
          <button
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            Medical Validator
          </button>
          <button
            className="w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          >
            Admin
          </button>
        </div>
        <p className="mt-6 text-center text-slate-600 dark:text-slate-400">
          <Link href="/login" className="text-blue-600 hover:underline">
            Back to Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}