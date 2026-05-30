import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppStore } from './store/appStore';

const PUBLIC_ROUTES = ['/', '/login', '/register', '/forgot-password', '/verify'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isInitialized } = useAppStore();

  useEffect(() => {
    const init = useAppStore.getState().initialize;
    init?.();
  }, []);

  useEffect(() => {
    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
    
    if (!isInitialized) return;

    if (!user && !isPublicRoute) {
      router.push('/login');
    }

    if (user && pathname === '/role-select') {
      router.push(user.role === 'admin' ? '/admin' : user.role === 'validator' ? '/validator' : '/app');
    }
  }, [user, isInitialized, pathname, router]);

  return <>{children}</>;
}