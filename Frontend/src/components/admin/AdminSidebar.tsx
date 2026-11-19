'use client';

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
} from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

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
    router.replace('/admin/login');
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between min-h-screen border-r border-slate-800 shrink-0">
      <div>
        {/* Header Branding */}
        <div className="p-6 border-b border-slate-800">
          <span className="text-xs uppercase tracking-widest text-amber-500 font-bold">
            Klinik CMS Panel
          </span>
          <h2 className="text-base font-serif font-bold text-white mt-1">
            Prof. Dr. Mustafa Özdemir
          </h2>
          <span className="text-[11px] text-slate-400">
            Ataköy Towers Kliniği
          </span>
        </div>

        {/* Navigation items */}
        <nav className="p-4 space-y-1.5">
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
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Actions */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <span>Canlı Siteyi Görüntüle</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/40 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Güvenli Çıkış Yap</span>
        </button>
      </div>
    </aside>
  );
}
