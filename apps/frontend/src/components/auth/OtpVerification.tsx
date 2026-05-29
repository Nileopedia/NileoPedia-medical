'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAppStore } from '../../store/appStore';
import { currentUser } from '../../data/mockData';
import { Shield, Mail, Loader2 } from 'lucide-react';

export const OtpVerification: React.FC = () => {
  const router = useRouter();
  const { otpState, setUser, setOtpState } = useAppStore();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [trustDevice, setTrustDevice] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timer > 0) {
      timerRef.current = setInterval(() => setTimer((t) => t - 1), 1000);
    } else if (timer === 0 && timerRef.current) {
      setCanResend(true);
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timer]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    
    setLoading(true);
    // Simulate API verification
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Simulate successful verification (accept any 6 digit code for demo, e.g., '123456')
    const mockUser = { 
      ...currentUser, 
      email: otpState.email, 
      role: otpState.role,
      title: otpState.role === 'admin' ? 'System Administrator' : 'Medical Validator'
    };
    
    setUser(mockUser);
    setOtpState({ needsOtp: false, email: '', role: 'validator' });
    setLoading(false);
    router.push('/app');
  };

  const handleResend = () => {
    setTimer(60);
    setCanResend(false);
    setOtp('');
    // In a real app, trigger API to resend OTP
  };

  if (!otpState.needsOtp) {
    return null; // Or redirect to login
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-200">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <div className="text-left">
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">NileoPedia</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Medical Intelligence Platform</p>
            </div>
          </div>
        </div>

        {/* OTP Form */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2">Verification Required</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Enter the 6-digit verification code sent to:
            </p>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mt-1 flex items-center justify-center gap-1">
              <Mail size={14} className="text-slate-400 dark:text-slate-500" /> {otpState.email}
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <Input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                className="text-center text-2xl tracking-[0.5em] font-mono h-14"
                maxLength={6}
                required
                autoFocus
              />
              <p className="text-xs text-center text-slate-400 mt-2">
                Code expires in 5 minutes. (Demo: use any 6 digits)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="trust-device"
                checked={trustDevice}
                onChange={(e) => setTrustDevice(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-slate-800" 
              />
              <label htmlFor="trust-device" className="text-sm text-slate-600 dark:text-slate-400">
                Trust this device for 30 days
              </label>
            </div>

            <Button type="submit" className="w-full h-11 text-base" disabled={otp.length !== 6 || loading}>
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                <>
                  Verify &amp; Login
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Didn&apos;t receive the code?{' '}
              {canResend ? (
                <button onClick={handleResend} className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                  Resend Code
                </button>
              ) : (
                <span className="text-slate-400 dark:text-slate-500">Resend in {timer}s</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
