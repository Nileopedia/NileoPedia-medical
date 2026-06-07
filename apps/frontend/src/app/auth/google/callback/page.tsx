'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppStore } from '../../../../store/appStore';

export default function GoogleCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAppStore((state) => state.setUser);

  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const error = searchParams.get('error');

    if (error) {
      router.push('/login?error=google_auth_failed');
      return;
    }

    if (accessToken) {
      localStorage.setItem('token', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }

      // Decode JWT to get user info (basic decode without verification)
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        const user = {
          id: payload.id,
          name: payload.email.split('@')[0],
          email: payload.email,
          role: payload.role?.toLowerCase() || 'user',
        };
        setUser(user);

        const destination =
          payload.role === 'admin' ? '/admin' : payload.role === 'validator' ? '/validator' : '/app';
        router.push(destination);
      } catch {
        router.push('/login?error=invalid_token');
      }
    } else {
      router.push('/login?error=no_token');
    }
  }, [searchParams, router, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-slate-600">Completing Google sign-in...</p>
      </div>
    </div>
  );
}