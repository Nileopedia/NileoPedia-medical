import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/Button';
import { useAppStore } from '../../store/appStore';
import { api } from '../../lib/api';
import { Shield, Mail, Loader2 } from 'lucide-react';

export const OtpVerification: React.FC = () => {
  const router = useRouter();
  const { otpState, setUser, setOtpState } = useAppStore();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    setError(null);
    try {
      const result = await api.verifyOtp(otpState.email, otp);
      localStorage.setItem('token', result.token);
      if (result.refreshToken) {
        localStorage.setItem('refreshToken', result.refreshToken);
      }
      setUser(result.user);
      setOtpState({ needsOtp: false, email: '', role: 'validator' });
      const destination =
        result.user.role === 'admin' ? '/admin' : result.user.role === 'validator' ? '/validator' : '/app';
      router.push(destination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setTimer(60);
    setCanResend(false);
    setOtp('');
  };

  if (!otpState.needsOtp) {
    return null;
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
              <h1 className="text-xl font-bold text-foreground">NileoPedia</h1>
              <p className="text-xs text-muted-foreground">Medical Intelligence Platform</p>
            </div>
          </div>
        </div>

        {/* OTP Form */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Verification Required</h2>
            <p className="text-sm text-muted-foreground">
              Enter the 6-digit verification code sent to:
            </p>
            <p className="text-sm font-medium text-foreground mt-1 flex items-center justify-center gap-1">
              <Mail size={14} className="text-muted-foreground/70" /> {otpState.email}
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 font-medium">
              Demo mode: Enter any 6 digits (e.g., 123456) to verify
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                className="w-full px-4 py-3 border border-border rounded-lg text-center text-2xl tracking-[0.5em] font-mono h-14 text-foreground placeholder-slate-400 dark:placeholder-slate-500 bg-card focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={6}
                required
                autoFocus
              />
<p className="text-xs text-center text-slate-400 mt-2">
                 Demo mode - enter any 6 digits
               </p>
            </div>

            {error && <p className="text-sm text-red-600 text-center">{error}</p>}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="trust-device"
                checked={trustDevice}
                onChange={(e) => setTrustDevice(e.target.checked)}
                className="w-4 h-4 rounded border-border text-blue-600 focus:ring-blue-500 bg-card"
              />
              <label htmlFor="trust-device" className="text-sm text-muted-foreground">
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
            <p className="text-sm text-muted-foreground">
              Didn&apos;t receive the code?{' '}
              {canResend ? (
                <button onClick={handleResend} className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                  Use Demo Code (123456)
                </button>
              ) : (
                <span className="text-muted-foreground/70">Resend in {timer}s</span>
              )}
              <span className="block text-xs text-slate-400 mt-1">(Demo: email verification skipped)</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
