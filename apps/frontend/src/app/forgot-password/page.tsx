'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg w-full max-w-md"
      >
        <h1 className="text-3xl font-bold text-center text-slate-900 dark:text-slate-50 mb-6">Forgot Password?</h1>
        <p className="text-center text-slate-600 dark:text-slate-400 mb-8">
          This is a placeholder for the forgot password page.
          Enter your email to receive a reset link.
        </p>
        <div className="space-y-4">
          {/* Forgot password form elements would go here */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Reset Password
          </button>
        </div>
        <p className="mt-6 text-center text-slate-600 dark:text-slate-400">
          Remembered your password?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}