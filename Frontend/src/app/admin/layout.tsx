'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { authService } from '@/services';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;

    async function verifySession() {
      if (isLoginPage) {
        if (active) setIsAuthenticated(true);
        return;
      }

      if (authService.isAuthenticated()) {
        if (active) setIsAuthenticated(true);
        return;
      }

      // Silent Refresh on page reload (F5) using HttpOnly Refresh Token Cookie
      const refreshed = await authService.refreshSession();
      if (!active) return;

      if (refreshed) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        router.replace('/admin/login');
      }
    }

    verifySession();

    return () => {
      active = false;
    };
  }, [router, isLoginPage]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
        <span className="text-sm font-medium">Yetki kontrolü yapılıyor...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      <AdminSidebar />
      <main className="flex-1 p-6 sm:p-10 max-w-7xl mx-auto w-full overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
