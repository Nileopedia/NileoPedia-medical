import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Shield, Mail, CheckCircle, Loader2 } from 'lucide-react';

export const PublicOtpVerify: React.FC = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);
    navigate('/role-select');
  };

  const handleResend = () => {
    setTimer(60);
    setCanResend(false);
    setOtp('');
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
            <h2 className="text-4xl font-bold text-white mb-4">Secure Verification</h2>
            <p className="text-slate-300 text-lg mb-12">
              Protecting your medical account with enterprise-grade security.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                  <Shield size={20} className="text-blue-400" />
                </div>
                <span className="text-slate-200">Two-factor authentication</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                  <Mail size={20} className="text-blue-400" />
                </div>
                <span className="text-slate-200">Email verification required</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                  <CheckCircle size={20} className="text-blue-400" />
                </div>
                <span className="text-slate-200">Trusted medical platform</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-slate-400 text-sm text-center">© 2025 NileoPedia. All rights reserved.</p>
        </div>
      </motion.div>

      {/* Right Panel - OTP Form */}
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

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield size={32} className="text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Verification Required</h2>
            <p className="text-slate-500">
              Enter the 6-digit verification code sent to your email.
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                className="w-full px-4 py-4 border border-slate-300 rounded-lg text-center text-2xl tracking-[0.5em] font-mono text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                maxLength={6}
                required
                autoFocus
              />
              <p className="text-xs text-center text-slate-400 mt-2">
                Code expires in 5 minutes
              </p>
            </div>

            <button
              type="submit"
              disabled={otp.length !== 6 || loading}
              className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify & Continue'
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-slate-500">
              Didn't receive the code?{' '}
              {canResend ? (
                <button onClick={handleResend} className="text-blue-600 hover:text-blue-700 font-medium">
                  Resend Code
                </button>
              ) : (
                <span className="text-slate-400">Resend in {timer}s</span>
              )}
            </p>
          </div>

          <div className="text-center mt-8">
            <Link to="/login" className="text-sm text-slate-500 hover:text-slate-700">
              ← Back to Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
