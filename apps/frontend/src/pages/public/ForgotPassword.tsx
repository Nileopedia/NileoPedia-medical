import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, BookOpen, Shield, Key, CheckCircle } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Dark Branding */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-12 flex-col justify-between relative overflow-hidden"
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-400 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <BookOpen size={22} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-white">NileoPedia</span>
          </div>

          <div>
            <h2 className="text-4xl font-bold text-white mb-4">Reset Your Password</h2>
            <p className="text-slate-300 text-lg mb-12">
              No worries! Enter your email and we'll send you a secure 6-digit code.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                  <Shield size={20} className="text-blue-400" />
                </div>
                <span className="text-slate-200">Secure verification</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                  <Mail size={20} className="text-blue-400" />
                </div>
                <span className="text-slate-200">6-digit code to your email</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                  <CheckCircle size={20} className="text-blue-400" />
                </div>
                <span className="text-slate-200">Quick and easy process</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 border-2 border-slate-600 rounded-2xl flex items-center justify-center">
              <Key size={48} className="text-slate-500" />
            </div>
          </div>
          <p className="text-slate-400 text-sm text-center">© 2025 NileoPedia. All rights reserved.</p>
        </div>
      </motion.div>

      {/* Right Panel - Form */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex-1 flex items-center justify-center p-8 bg-white"
      >
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <BookOpen size={22} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">NileoPedia</span>
          </div>

          {!sent ? (
            <>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Forgot Password</h2>
              <p className="text-slate-500 mb-8">
                Enter your email address and we'll send you a 6-digit verification code.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send Verification Code'}
                </button>
              </form>

              <p className="text-center mt-8 text-sm text-slate-500">
                Remember your password?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign in
                </Link>
              </p>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={32} className="text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Code Sent!</h2>
              <p className="text-slate-500 mb-8">
                We've sent a 6-digit verification code to <span className="font-medium text-slate-900">{email}</span>
              </p>
              <Link
                to="/otp-verify"
                className="inline-block w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all"
              >
                Enter Verification Code
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
