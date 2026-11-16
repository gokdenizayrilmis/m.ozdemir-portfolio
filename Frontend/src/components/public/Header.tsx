'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Category, SiteSettings, Treatment } from '@/types';
import { Phone, MessageCircle, Menu, X, ChevronDown, ArrowRight } from 'lucide-react';
import { trackConversionClick } from '@/hooks/use-utm-tracker';
import { createWhatsAppUrl, resolveMediaUrl } from '@/utils/cn';

interface HeaderProps {
  categories: Category[];
  treatments: Treatment[];
  settings: SiteSettings | null;
}

const MAIN_BRANCHES = [
  { slug: 'dermatoloji', label: 'Dermatoloji' },
  { slug: 'kozmetik-dermatoloji', label: 'Kozmetik Dermatoloji' },
  { slug: 'sac-hastaliklari', label: 'Saç Hastalıkları' },
  { slug: 'lazer', label: 'Lazer' },
];

export default function Header({ categories, treatments, settings }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openBranchSlug, setOpenBranchSlug] = useState<string | null>(null);
  const [mobileOpenBranch, setMobileOpenBranch] = useState<string | null>(null);

  const phone = settings?.phoneNumbers?.[0] || '+90 552 265 64 36';
  const whatsappNumber = settings?.whatsAppNumber || '905522656436';
  const waUrl = createWhatsAppUrl(whatsappNumber);
  const logoSrc = resolveMediaUrl(
    settings?.logoUrl,
    '/uploads/corporate/logo.png'
  );

  const handlePhoneClick = () => {
    trackConversionClick('PhoneClick', window.location.pathname);
  };

  const handleWhatsAppClick = () => {
    trackConversionClick('WhatsAppClick', window.location.pathname);
  };

  const branches = MAIN_BRANCHES.map((branch) => {
    const matchedCat = categories.find((c) => c.slug === branch.slug);
    const branchTreatments = treatments
      .filter((t) => t.categorySlug === branch.slug)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    return {
      slug: branch.slug,
      label: branch.label,
      fullTitle: matchedCat?.title || branch.label,
      treatments: branchTreatments,
    };
  });

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-bronze-200/70 shadow-sm transition-all">
      {/* Top Bar for Desktop (Logo Espresso Palette) */}
      <div className="hidden xl:block bg-espresso-900 text-peach-100/90 text-xs py-2">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <span>
              {settings?.address ||
                'Ataköy Towers B-Blok No:146, Bakırköy / İstanbul'}
            </span>
            <span className="text-bronze-400">•</span>
            <span>
              {settings?.workingHours ||
                'Çalışma Saatleri: Pzt - Cmt 09:30 - 19:00'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/blog" className="hover:text-peach-200 transition">
              Akademik Blog & Makaleler
            </Link>
            <span className="text-bronze-700">|</span>
            <a
              href={`tel:${phone.replace(/\s+/g, '')}`}
              onClick={handlePhoneClick}
              className="flex items-center gap-1.5 hover:text-white transition font-medium"
            >
              <Phone className="w-3.5 h-3.5 text-bronze-400" />
              <span>{phone}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 sm:h-[88px] flex items-center justify-between gap-4">
        {/* Left: Clickable Logo Emblem Only (No Extra Text) */}
        <Link
          href="/"
          aria-label={settings?.doctorName || 'Prof. Dr. Mustafa Özdemir Ana Sayfa'}
          className="flex items-center shrink-0 py-1 rounded-xl hover:opacity-90 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-bronze-500"
        >
          {logoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoSrc}
              alt={settings?.doctorName || 'Prof. Dr. Mustafa Özdemir'}
              className="h-12 sm:h-14 lg:h-16 w-auto max-w-[220px] sm:max-w-[260px] object-contain"
            />
          ) : (
            <span className="text-lg font-serif font-bold text-espresso-900">
              {settings?.doctorName || 'Prof. Dr. Mustafa Özdemir'}
            </span>
          )}
        </Link>

        {/* Center: Live Site 4-Branch Navigation + Pages */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-6 text-[13px] font-semibold text-espresso-800">
          <Link
            href="/"
            className="hover:text-bronze-600 transition whitespace-nowrap py-2"
          >
            Anasayfa
          </Link>

          <Link
            href="/hakkimizda"
            className="hover:text-bronze-600 transition whitespace-nowrap py-2"
          >
            Hakkımızda
          </Link>

          {/* 4 Main Expertise Branches with Hover Dropdowns */}
          {branches.map((branch) => {
            const isOpen = openBranchSlug === branch.slug;
            const isMultiColumn = branch.treatments.length > 8;

            return (
              <div
                key={branch.slug}
                className="relative"
                onMouseEnter={() => setOpenBranchSlug(branch.slug)}
                onMouseLeave={() => setOpenBranchSlug(null)}
              >
                <Link
                  href={`/kategori/${branch.slug}`}
                  className={`flex items-center gap-1 py-2 whitespace-nowrap transition ${
                    isOpen ? 'text-bronze-700' : 'hover:text-bronze-600'
                  }`}
                >
                  <span>{branch.label}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-150 ${
                      isOpen ? 'rotate-180 text-bronze-700' : 'text-bronze-400'
                    }`}
                  />
                </Link>

                {isOpen && (
                  <div
                    className={`absolute top-full left-0 bg-white rounded-2xl shadow-2xl border border-bronze-200/90 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 ${
                      isMultiColumn ? 'w-[520px]' : 'w-72'
                    }`}
                  >
                    <div className="px-3 py-2 mb-1.5 border-b border-bronze-100 flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-bronze-700">
                        {branch.fullTitle}
                      </span>
                      <Link
                        href={`/kategori/${branch.slug}`}
                        onClick={() => setOpenBranchSlug(null)}
                        className="text-[11px] font-semibold text-espresso-700 hover:text-bronze-700 inline-flex items-center gap-1"
                      >
                        <span>Tümünü Gör</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>

                    {branch.treatments.length > 0 ? (
                      <div
                        className={`grid gap-1 ${
                          isMultiColumn ? 'grid-cols-2' : 'grid-cols-1'
                        }`}
                      >
                        {branch.treatments.map((t) => (
                          <Link
                            key={t.id}
                            href={`/${t.slug}`}
                            onClick={() => setOpenBranchSlug(null)}
                            className="px-3 py-2 rounded-xl text-xs font-medium text-espresso-800 hover:bg-peach-50 hover:text-bronze-800 transition flex items-center justify-between group/item"
                          >
                            <span className="truncate">{t.title}</span>
                            <ArrowRight className="w-3 h-3 text-bronze-600 opacity-0 group-hover/item:opacity-100 transition shrink-0 ml-2" />
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <Link
                        href={`/kategori/${branch.slug}`}
                        onClick={() => setOpenBranchSlug(null)}
                        className="block px-3 py-2 text-xs text-espresso-700 hover:text-bronze-800"
                      >
                        {branch.label} tedavilerini inceleyin →
                      </Link>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          <Link
            href="/iletisim"
            className="hover:text-bronze-600 transition whitespace-nowrap py-2"
          >
            İletişim
          </Link>

          <Link
            href="/kvkk"
            className="hover:text-bronze-600 transition whitespace-nowrap py-2"
          >
            KVKK
          </Link>
        </nav>

        {/* Right: Clickable Phone + Prominent Green WhatsApp Randevu Button */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <a
            href={`tel:${phone.replace(/\s+/g, '')}`}
            onClick={handlePhoneClick}
            className="hidden xl:flex items-center gap-1.5 text-xs font-bold text-espresso-900 hover:text-bronze-700 px-3 py-2 rounded-xl bg-bronze-50 hover:bg-peach-100 border border-bronze-200/70 transition"
          >
            <Phone className="w-3.5 h-3.5 text-bronze-700" />
            <span>{phone}</span>
          </a>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWhatsAppClick}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-full text-xs font-bold shadow-md shadow-emerald-600/20 transition hover:shadow-lg whitespace-nowrap"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp Randevu</span>
          </a>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex lg:hidden items-center gap-2">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWhatsAppClick}
            className="p-2 text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100"
            aria-label="WhatsApp Randevu"
          >
            <MessageCircle className="w-5 h-5" />
          </a>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-espresso-900 rounded-lg hover:bg-peach-50 focus:outline-none"
            aria-label="Menü"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-bronze-200 px-6 py-6 shadow-xl space-y-3 max-h-[82vh] overflow-y-auto">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-bold text-espresso-900 hover:text-bronze-700 py-1"
          >
            Anasayfa
          </Link>
          <Link
            href="/hakkimizda"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-bold text-espresso-900 hover:text-bronze-700 py-1"
          >
            Hakkımızda
          </Link>

          <div className="border-t border-b border-bronze-100 py-3 space-y-2">
            <span className="text-[11px] uppercase font-bold tracking-wider text-bronze-700 block">
              Uzmanlık Branşları & Tedaviler
            </span>
            {branches.map((branch) => {
              const isExpanded = mobileOpenBranch === branch.slug;
              return (
                <div key={branch.slug} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/kategori/${branch.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-sm font-semibold text-espresso-800 hover:text-bronze-700 py-1"
                    >
                      {branch.label}
                    </Link>
                    <button
                      type="button"
                      onClick={() =>
                        setMobileOpenBranch(isExpanded ? null : branch.slug)
                      }
                      className="p-1.5 text-bronze-600 hover:text-bronze-800 rounded-lg"
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          isExpanded ? 'rotate-180 text-bronze-700' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="pl-3 border-l-2 border-peach-200 space-y-1.5 py-1">
                      {branch.treatments.map((t) => (
                        <Link
                          key={t.id}
                          href={`/${t.slug}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block text-xs text-espresso-700 hover:text-bronze-800 py-0.5"
                        >
                          • {t.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <Link
            href="/iletisim"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-bold text-espresso-900 hover:text-bronze-700 py-1"
          >
            İletişim
          </Link>
          <Link
            href="/kvkk"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-bold text-espresso-900 hover:text-bronze-700 py-1"
          >
            KVKK
          </Link>

          <div className="pt-3 flex flex-col gap-2.5">
            <a
              href={`tel:${phone.replace(/\s+/g, '')}`}
              onClick={handlePhoneClick}
              className="flex items-center justify-center gap-2 bg-espresso-900 text-white py-3 rounded-xl text-xs font-bold"
            >
              <Phone className="w-4 h-4 text-bronze-400" />
              <span>Kliniği Ara: {phone}</span>
            </a>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleWhatsAppClick}
              className="flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl text-xs font-bold"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Randevu</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
