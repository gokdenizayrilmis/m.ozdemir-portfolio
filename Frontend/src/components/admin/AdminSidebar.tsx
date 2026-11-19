'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { authService } from '@/services';
import {
  LayoutDashboard,
  Stethoscope,
  BookOpen,
  Settings,
  LogOut,
  ExternalLink,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from 'lucide-react';

const SIDEBAR_STORAGE_KEY = 'admin_sidebar_collapsed';

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function AdminSidebar({
  mobileOpen = false,
  onCloseMobile,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      if (saved === 'true') {
        setIsCollapsed(true);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  };

  const navItems = [
    {
      title: 'Dönüşüm Özeti',
      href: '/admin',
      icon: LayoutDashboard,
    },
    {
      title: 'Tedavi Sayfaları',
      href: '/admin/treatments',
      icon: Stethoscope,
    },
    {
      title: 'Blog & Makaleler',
      href: '/admin/blogs',
      icon: BookOpen,
    },
    {
      title: 'Klinik Ayarları',
      href: '/admin/settings',
      icon: Settings,
    },
  ];

  const handleLogout = async () => {
    await authService.logout();
    onCloseMobile?.();
    router.replace('/admin/login');
  };

  const renderSidebarContent = (collapsed: boolean, isMobileDrawer: boolean) => (
    <>
      <div>
        {/* Header Branding + Collapse Toggle */}
        <div
          className={`border-b border-slate-800 flex items-center ${
            collapsed ? 'flex-col gap-3 py-4 px-2' : 'justify-between p-5'
          }`}
        >
          {collapsed ? (
            <div
              title="Prof. Dr. Mustafa Özdemir — Klinik CMS"
              className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-heading font-bold text-sm tracking-tight"
            >
              MÖ
            </div>
          ) : (
            <div className="min-w-0">
              <span className="text-[10px] uppercase tracking-widest text-amber-500 font-semibold block">
                Klinik CMS Panel
              </span>
              <h2 className="text-sm font-heading font-bold tracking-tight text-white mt-0.5 truncate">
                Prof. Dr. Mustafa Özdemir
              </h2>
              <span className="text-[11px] text-slate-400 block truncate">
                Ataköy Towers Kliniği
              </span>
            </div>
          )}

          {isMobileDrawer ? (
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Menüyü Kapat"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={toggleCollapse}
              title={collapsed ? 'Menüyü Genişlet' : 'Menüyü Daralt'}
              aria-label={collapsed ? 'Menüyü Genişlet' : 'Menüyü Daralt'}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition shrink-0"
            >
              {collapsed ? (
                <PanelLeftOpen className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Navigation items */}
        <nav className={`space-y-1.5 ${collapsed ? 'p-2.5' : 'p-4'}`}>
          {navItems.map((item) => {
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onCloseMobile?.()}
                title={collapsed ? item.title : undefined}
                className={`group relative flex items-center rounded-xl text-sm font-medium transition-all ${
                  collapsed
                    ? 'justify-center p-3'
                    : 'gap-3 px-3.5 py-2.5'
                } ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span className="truncate">{item.title}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Actions */}
      <div
        className={`border-t border-slate-800 space-y-2 ${
          collapsed ? 'p-2.5' : 'p-4'
        }`}
      >
        <Link
          href="/"
          target="_blank"
          title={collapsed ? 'Canlı Siteyi Görüntüle' : undefined}
          className={`flex items-center rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition ${
            collapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-2.5'
          }`}
        >
          {!collapsed && <span>Canlı Siteyi Görüntüle</span>}
          <ExternalLink className="w-4 h-4 shrink-0" />
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          title={collapsed ? 'Güvenli Çıkış Yap' : undefined}
          className={`w-full flex items-center rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/40 transition ${
            collapsed ? 'justify-center p-3' : 'gap-2.5 px-3.5 py-2.5'
          }`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Güvenli Çıkış Yap</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sticky Collapsible Sidebar */}
      <aside
        className={`hidden lg:flex lg:sticky lg:top-0 lg:h-screen shrink-0 bg-slate-900 text-slate-300 flex-col justify-between border-r border-slate-800 overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-[76px]' : 'w-64'
        }`}
      >
        {renderSidebarContent(isCollapsed, false)}
      </aside>

      {/* Mobile Slide-Over Drawer + Backdrop */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
          />
          <aside className="relative z-10 w-64 max-w-[80vw] h-full bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 shadow-2xl overflow-y-auto">
            {renderSidebarContent(false, true)}
          </aside>
        </div>
      )}
    </>
  );
}
