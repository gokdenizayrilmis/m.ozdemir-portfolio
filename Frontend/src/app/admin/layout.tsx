'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { LazyMotion, MotionConfig, domMax } from 'motion/react';
import AdminSidebar, {
  SETTINGS_SUB_ITEMS,
} from '@/components/admin/AdminSidebar';
import { AdminToastProvider } from '@/components/admin/AdminToast';
import AdminNetworkIndicator from '@/components/admin/AdminNetworkIndicator';
import { authService } from '@/services';
import { ChevronRight, ExternalLink, Loader2, Menu } from 'lucide-react';

function AdminTopbar({ onOpenMobileMenu }: { onOpenMobileMenu: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'contact';

  const getBreadcrumbs = () => {
    if (pathname === '/admin') {
      return ['Panel', 'Dönüşüm Özeti'];
    }
    if (pathname.startsWith('/admin/treatments')) {
      return ['Panel', 'Tedavi Sayfaları'];
    }
    if (pathname.startsWith('/admin/blogs')) {
      return ['Panel', 'Blog & Makaleler'];
    }
    if (pathname.startsWith('/admin/settings')) {
      const sub = SETTINGS_SUB_ITEMS.find((s) => s.tab === activeTab);
      return ['Panel', 'Klinik Ayarları', sub?.title || 'İletişim & Konum'];
    }
    return ['Panel'];
  };

  const crumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-30 h-14 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile Hamburger + Dynamic Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Yönetim Menüsünü Aç"
          className="lg:hidden p-2 -ml-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs sm:text-[13px] min-w-0"
        >
          {crumbs.map((crumb, idx) => {
            const isLast = idx === crumbs.length - 1;
            return (
              <span key={crumb} className="flex items-center gap-1.5 min-w-0">
                {idx > 0 && (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                )}
                <span
                  className={
                    isLast
                      ? 'font-semibold text-slate-900 truncate'
                      : 'font-medium text-slate-500 truncate'
                  }
                >
                  {crumb}
                </span>
              </span>
            );
          })}
        </nav>
      </div>

      {/* Right: Quick Live Site Link + Admin Profile Badge */}
      <div className="flex items-center gap-3 shrink-0">
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-medium shadow-2xs transition"
        >
          <span>Canlı Siteyi Aç</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </Link>

        <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="w-7 h-7 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center text-[11px] font-heading font-bold tracking-tight">
            MÖ
          </div>
          <span className="text-xs font-semibold text-slate-800">
            Prof. Dr. Mustafa Özdemir
          </span>
        </div>
      </div>
    </header>
  );
}

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

  const fontWrapperClass = 'admin-shell';

  if (isLoginPage) {
    return (
      <LazyMotion features={domMax}>
        <MotionConfig reducedMotion="user">
          <div className={fontWrapperClass}>
            {children}
            <AdminNetworkIndicator />
          </div>
        </MotionConfig>
      </LazyMotion>
    );
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
    <LazyMotion features={domMax}>
      <MotionConfig reducedMotion="user">
        <AdminToastProvider>
          <AdminNetworkIndicator />
          <div
            className={`${fontWrapperClass} min-h-screen bg-slate-50/70 flex flex-col lg:flex-row`}
          >
            <Suspense fallback={null}>
              <AdminSidebar
                mobileOpen={mobileMenuOpen}
                onCloseMobile={() => setMobileMenuOpen(false)}
              />
            </Suspense>

            <div className="flex-1 min-w-0 flex flex-col min-h-screen">
              <Suspense
                fallback={
                  <div className="h-14 border-b border-slate-200/80 bg-white/85" />
                }
              >
                <AdminTopbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />
              </Suspense>

              <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-6 py-6">
                {children}
              </main>
            </div>
          </div>
        </AdminToastProvider>
      </MotionConfig>
    </LazyMotion>
  );
}
