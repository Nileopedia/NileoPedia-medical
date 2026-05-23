import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAppStore } from '../store/appStore';
import { currentUser } from '../data/mockData';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { OtpVerification } from '../components/auth/OtpVerification';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setUser, setOtpState } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Determine role based on email for demo purposes
    let role: 'user' | 'validator' | 'admin' = 'user';
    if (email.toLowerCase().includes('validator')) role = 'validator';
    if (email.toLowerCase().includes('admin')) role = 'admin';

    const loggedInUser = { ...currentUser, email, role };

    if (role === 'validator' || role === 'admin') {
      // Trigger OTP flow for sensitive roles
      setOtpState({ needsOtp: true, email, role });
      setStep('otp');
      setLoading(false);
    } else {
      // Direct login for medical users
      setUser(loggedInUser);
      setLoading(false);
      navigate('/');
    }
  };

  const handleGoogleLogin = async () => {
    // Redirect to backend Google OAuth endpoint
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/v1/auth/google/login`;
  };

  if (step === 'otp') {
    return <OtpVerification />;
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
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">Welcome back</h2>
          <p className="text-slate-500 dark:text-slate-400">Sign in to your account to continue</p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@example.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-slate-800" />
                <span className="text-sm text-slate-600 dark:text-slate-400">Remember me</span>
              </label>
              <a href="#" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                Forgot password?
              </a>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </div>

        {/* Divider */}
        <div className="relative text-center my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-300 dark:border-slate-600"></div>
          </div>
          <div className="relative flex justify-center text-sm text-slate-500 dark:text-slate-400 px-2">
            Or continue with
          </div>
        </div>

        {/* Google Button */}
        <Button 
          onClick={handleGoogleLogin}
          variant="outline"
          className="w-full flex items-center justify-center gap-3"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 48 48" 
            fill="none"
          >
            <path 
              fill="#EA4335" 
              d="M24 9.6c-4.9 0-9.1 3.3-9.9 7.7h15.3c-.4-3.3-2.5-6.1-5.4-7.7z"
            />
            <path 
              fill="#4285F4" 
              d="M46.6 24c0-2.6-.2-5.1-.5-7.5h-7.9c.4 2 1 3.9 1.8 5.6h9.2c1.2-3.2 1.9-7 1.9-11.1z"
            />
            <path 
              fill="#FBBC05" 
              d="M12.4 24.2c2.9-.8 5.5-2.4 7.5-4.5H7.9c-2.2 3.8-2.2 8.7 0 12.5h6.6c1.2-1.4 2.6-2.5 4.2-3.2z"
            />
            <path 
              fill="#34A853" 
              d="M6.6 15.9c2.2 3.8 2.2 8.7 0 12.5H.7V24h5.9c1.9-2.4 3-5.2 3-8.1z"
            />
          </svg>
          Continue with Google
        </Button>

        {/* Register link */}
        <p className="text-center mt-6 text-sm text-slate-500 dark:text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
};
