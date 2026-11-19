'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Plus_Jakarta_Sans, Inter } from 'next/font/google';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { authService } from '@/services';
import { Loader2, Menu } from 'lucide-react';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});

const interAdmin = Inter({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter-admin',
  display: 'swap',
});

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const fontWrapperClass = `${plusJakartaSans.variable} ${interAdmin.variable} admin-shell`;

  if (isLoginPage) {
    return <div className={fontWrapperClass}>{children}</div>;
  }

  if (!isAuthenticated) {
    return (
      <div
        className={`${fontWrapperClass} min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 gap-3`}
      >
        <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
        <span className="text-sm font-medium">Yetki kontrolü yapılıyor...</span>
      </div>
    );
  }

  return (
    <div
      className={`${fontWrapperClass} min-h-screen bg-slate-100 flex flex-col lg:flex-row`}
    >
      {/* Mobile Top Bar (< lg) */}
      <header className="lg:hidden sticky top-0 z-30 bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Yönetim Menüsünü Aç"
            className="p-2 -ml-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <span className="text-[10px] uppercase tracking-widest text-amber-500 font-semibold block leading-none">
              Klinik CMS Panel
            </span>
            <span className="text-sm font-heading font-bold tracking-tight text-white truncate block mt-0.5">
              Prof. Dr. Mustafa Özdemir
            </span>
          </div>
        </div>
      </header>

      <AdminSidebar
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <main className="flex-1 min-w-0 p-5 sm:p-8 lg:p-10">
        <div className="max-w-7xl mx-auto w-full">{children}</div>
      </main>
    </div>
  );
}
