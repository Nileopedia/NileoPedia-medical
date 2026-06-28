'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, UserPlus, Mail, Lock, Building2, Stethoscope, ShieldCheck } from 'lucide-react';
import { api } from '../../lib/api';
import { useAppStore } from '../../store/appStore';

type RegisterRole = 'MEDICAL_USER' | 'VALIDATOR';

export default function RegisterPage() {
  const router = useRouter();
  const setUser = useAppStore((state) => state.setUser);
  const setOtpState = useAppStore((state) => state.setOtpState);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<RegisterRole>('MEDICAL_USER');
  const [institution, setInstitution] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await api.register(fullName, email, password, role, institution || undefined, specialization || undefined);
      localStorage.setItem('token', result.token);
      if (result.refreshToken) {
        localStorage.setItem('refreshToken', result.refreshToken);
      }
      setUser(result.user);
      // Validators and admins require OTP verification
      if (result.user.role === 'validator' || result.user.role === 'admin') {
        setOtpState({ needsOtp: true, email, role: result.user.role });
        router.push('/verify');
      } else {
        const destination = '/app';
        router.push(destination);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-400 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <BookOpen size={22} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-white">NileoPedia</span>
          </div>
          <div>
            <h2 className="text-4xl font-bold text-white mb-4">Create your account</h2>
            <p className="text-muted-foreground text-lg mb-12">Join the medical intelligence platform and start using evidence-backed answers.</p>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                  <UserPlus size={20} className="text-blue-400" />
                </div>
                <span className="text-foreground">Simple onboarding</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                  <ShieldCheck size={20} className="text-blue-400" />
                </div>
                <span className="text-foreground">Role-based access</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                  <Stethoscope size={20} className="text-blue-400" />
                </div>
                <span className="text-foreground">Built for clinical workflows</span>
              </div>
            </div>
          </div>
        </div>
        <div className="relative z-10">
          <p className="text-muted-foreground/70 text-sm">© 2025 NileoPedia. All rights reserved.</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-6 sm:mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <BookOpen size={22} className="text-white" />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-foreground">NileoPedia</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Create account</h1>
          <p className="text-sm text-muted-foreground mb-6 sm:mb-8">Register with the backend auth service.</p>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5 sm:mb-2">Full Name</label>
              <div className="relative">
                <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Dr. Jane Doe"
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5 sm:mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@hospital.org"
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5 sm:mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                  minLength={8}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5 sm:mb-2">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as RegisterRole)}
                className="w-full px-4 py-2.5 sm:py-3 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                <option value="MEDICAL_USER">Medical User</option>
                <option value="VALIDATOR">Validator</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5 sm:mb-2">Institution</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="Hospital / organization"
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5 sm:mb-2">Specialization</label>
              <input
                type="text"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder="Cardiology, Pediatrics, etc."
                className="w-full px-4 py-2.5 sm:py-3 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            {error && <p className="text-sm text-red-600 text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 sm:py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center mt-6 sm:mt-8 text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:text-primary/80 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}