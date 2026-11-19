'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, m } from 'motion/react';
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
  ChevronDown,
  MapPin,
  BarChart3,
  KeyRound,
  X,
} from 'lucide-react';

const SIDEBAR_STORAGE_KEY = 'admin_sidebar_collapsed';

export const SETTINGS_SUB_ITEMS = [
  {
    tab: 'contact',
    title: 'İletişim & Konum',
    href: '/admin/settings?tab=contact',
    icon: MapPin,
  },
  {
    tab: 'analytics',
    title: 'Analitik & SEO',
    href: '/admin/settings?tab=analytics',
    icon: BarChart3,
  },
  {
    tab: 'security',
    title: 'Güvenlik & Şifre',
    href: '/admin/settings?tab=security',
    icon: KeyRound,
  },
] as const;

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function AdminSidebar({
  mobileOpen = false,
  onCloseMobile,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const isSettingsRoute = pathname.startsWith('/admin/settings');
  const activeTab = searchParams.get('tab') || 'contact';

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [settingsExpanded, setSettingsExpanded] = useState(isSettingsRoute);

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

  useEffect(() => {
    if (isSettingsRoute) {
      setSettingsExpanded(true);
    }
  }, [isSettingsRoute]);

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

  const primaryNavItems = [
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
          className={`border-b border-slate-800/80 flex items-center ${
            collapsed ? 'flex-col gap-3 py-4 px-2' : 'justify-between p-5'
          }`}
        >
          {collapsed ? (
            <div
              title="Prof. Dr. Mustafa Özdemir — Klinik CMS"
              className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-400 flex items-center justify-center font-heading font-bold text-sm tracking-tight"
            >
              MÖ
            </div>
          ) : (
            <div className="min-w-0">
              <span className="text-[10px] uppercase tracking-widest text-amber-400 font-semibold block">
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
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={toggleCollapse}
              title={collapsed ? 'Menüyü Genişlet' : 'Menüyü Daralt'}
              aria-label={collapsed ? 'Menüyü Genişlet' : 'Menüyü Daralt'}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition shrink-0"
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
        <nav className={`space-y-1 ${collapsed ? 'p-2.5' : 'p-3.5'}`}>
          {primaryNavItems.map((item) => {
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
                className={`group relative flex items-center rounded-xl text-[13px] transition-all ${
                  collapsed ? 'justify-center p-3' : 'gap-3 px-3.5 py-2.5'
                } ${
                  isActive
                    ? 'bg-white/10 text-white font-medium border-l-2 border-amber-400'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 border-l-2 border-transparent'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive
                      ? 'text-amber-400'
                      : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                {!collapsed && <span className="truncate">{item.title}</span>}
              </Link>
            );
          })}

          {/* Klinik Ayarları Dropdown / Accordion */}
          {collapsed ? (
            <Link
              href="/admin/settings?tab=contact"
              onClick={() => onCloseMobile?.()}
              title="Klinik Ayarları"
              className={`group relative flex items-center justify-center p-3 rounded-xl text-[13px] transition-all ${
                isSettingsRoute
                  ? 'bg-white/10 text-white font-medium border-l-2 border-amber-400'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 border-l-2 border-transparent'
              }`}
            >
              <Settings
                className={`w-4 h-4 shrink-0 ${
                  isSettingsRoute
                    ? 'text-amber-400'
                    : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />
            </Link>
          ) : (
            <div className="pt-0.5">
              <button
                type="button"
                onClick={() => setSettingsExpanded((prev) => !prev)}
                className={`w-full group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-[13px] transition-all ${
                  isSettingsRoute
                    ? 'bg-white/10 text-white font-medium border-l-2 border-amber-400'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 border-l-2 border-transparent'
                }`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <Settings
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isSettingsRoute
                        ? 'text-amber-400'
                        : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span className="truncate">Klinik Ayarları</span>
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 shrink-0 text-slate-400 transition-transform duration-200 ${
                    settingsExpanded ? 'rotate-180 text-amber-400' : ''
                  }`}
                />
              </button>

              <AnimatePresence initial={false}>
                {settingsExpanded && (
                  <m.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="mt-1 ml-5 pl-3 border-l border-slate-800 space-y-1">
                      {SETTINGS_SUB_ITEMS.map((sub) => {
                        const SubIcon = sub.icon;
                        const isSubActive =
                          isSettingsRoute && activeTab === sub.tab;

                        return (
                          <Link
                            key={sub.tab}
                            href={sub.href}
                            onClick={() => onCloseMobile?.()}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all ${
                              isSubActive
                                ? 'bg-amber-400/15 text-amber-300 font-semibold'
                                : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 font-medium'
                            }`}
                          >
                            <SubIcon
                              className={`w-3.5 h-3.5 shrink-0 ${
                                isSubActive ? 'text-amber-400' : 'text-slate-500'
                              }`}
                            />
                            <span className="truncate">{sub.title}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </m.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </nav>
      </div>

      {/* Bottom Footer Actions */}
      <div
        className={`border-t border-slate-800/80 space-y-1.5 ${
          collapsed ? 'p-2.5' : 'p-3.5'
        }`}
      >
        <Link
          href="/"
          target="_blank"
          title={collapsed ? 'Canlı Siteyi Görüntüle' : undefined}
          className={`flex items-center rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition ${
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
          className={`w-full flex items-center rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition ${
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
      {/* Desktop Dark Slate Sticky Collapsible Sidebar */}
      <aside
        className={`hidden lg:flex lg:sticky lg:top-0 lg:h-screen shrink-0 bg-slate-950 text-slate-300 flex-col justify-between border-r border-slate-800/90 overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-[76px]' : 'w-64'
        }`}
      >
        {renderSidebarContent(isCollapsed, false)}
      </aside>

      {/* Mobile Slide-Over Drawer + Backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onCloseMobile}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            />
            <m.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 w-64 max-w-[80vw] h-full bg-slate-950 text-slate-300 flex flex-col justify-between border-r border-slate-800 shadow-2xl overflow-y-auto"
            >
              {renderSidebarContent(false, true)}
            </m.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
