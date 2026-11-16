'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, m } from 'motion/react';
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
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openBranchSlug, setOpenBranchSlug] = useState<string | null>(null);
  const [mobileOpenBranch, setMobileOpenBranch] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Transparent only when on Home Page and at the top of the page
  const isTransparent = isHomePage && !isScrolled && !mobileMenuOpen;

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
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isTransparent
            ? 'bg-transparent border-b border-white/10'
            : 'bg-white/95 backdrop-blur-md border-b border-bronze-200/80 shadow-md'
        }`}
      >
        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 lg:h-[84px] flex items-center justify-between gap-4">
          {/* Left: Clickable Logo Emblem Only (Completely Transparent Background) */}
          <Link
            href="/"
            aria-label={
              settings?.doctorName || 'Prof. Dr. Mustafa Özdemir Ana Sayfa'
            }
            className="flex items-center shrink-0 py-1.5 rounded-xl transition-all duration-300 hover:opacity-90 focus:outline-none"
          >
            {logoSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoSrc}
                alt={settings?.doctorName || 'Prof. Dr. Mustafa Özdemir'}
                className={`h-10 sm:h-11 lg:h-12 w-auto max-w-[200px] sm:max-w-[240px] lg:max-w-[260px] object-contain transition-all duration-300 ${
                  isTransparent
                    ? 'brightness-125 contrast-110 drop-shadow-[0_2px_10px_rgba(0,0,0,0.65)]'
                    : ''
                }`}
              />
            ) : (
              <span className="text-lg font-serif font-bold text-espresso-900">
                {settings?.doctorName || 'Prof. Dr. Mustafa Özdemir'}
              </span>
            )}
          </Link>

          {/* Center: Live Site 4-Branch Navigation + Pages */}
          <nav
            className={`hidden lg:flex items-center gap-4 xl:gap-5 text-[13px] font-semibold transition-colors duration-300 ${
              isTransparent ? 'text-white' : 'text-espresso-800'
            }`}
          >
            <Link
              href="/"
              className={`transition whitespace-nowrap py-2 ${
                isTransparent ? 'hover:text-peach-200' : 'hover:text-bronze-600'
              }`}
            >
              Anasayfa
            </Link>

            <Link
              href="/hakkimizda"
              className={`transition whitespace-nowrap py-2 ${
                isTransparent ? 'hover:text-peach-200' : 'hover:text-bronze-600'
              }`}
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
                      isTransparent
                        ? isOpen
                          ? 'text-peach-200'
                          : 'hover:text-peach-200'
                        : isOpen
                          ? 'text-bronze-700'
                          : 'hover:text-bronze-600'
                    }`}
                  >
                    <span>{branch.label}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-150 ${
                        isOpen
                          ? isTransparent
                            ? 'rotate-180 text-peach-200'
                            : 'rotate-180 text-bronze-700'
                          : isTransparent
                            ? 'text-white/75'
                            : 'text-bronze-400'
                      }`}
                    />
                  </Link>

                  <AnimatePresence>
                    {isOpen && (
                      <m.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                        className={`absolute top-full left-0 bg-white rounded-2xl shadow-2xl border border-bronze-200/90 p-3 z-50 ${
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
                      </m.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            <Link
              href="/iletisim"
              className={`transition whitespace-nowrap py-2 ${
                isTransparent ? 'hover:text-peach-200' : 'hover:text-bronze-600'
              }`}
            >
              İletişim
            </Link>

            <Link
              href="/kvkk"
              className={`transition whitespace-nowrap py-2 ${
                isTransparent ? 'hover:text-peach-200' : 'hover:text-bronze-600'
              }`}
            >
              KVKK
            </Link>
          </nav>

          {/* Right: Clickable Phone Only */}
          <div className="hidden lg:flex items-center shrink-0">
            <a
              href={`tel:${phone.replace(/\s+/g, '')}`}
              onClick={handlePhoneClick}
              className={`flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-full transition shadow-sm ${
                isTransparent
                  ? 'bg-bronze-600 hover:bg-bronze-500 text-white shadow-black/25'
                  : 'bg-bronze-50 hover:bg-peach-100 text-espresso-900 border border-bronze-200/80'
              }`}
            >
              <Phone
                className={`w-3.5 h-3.5 ${
                  isTransparent ? 'text-peach-100' : 'text-bronze-700'
                }`}
              />
              <span>{phone}</span>
            </a>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex lg:hidden items-center gap-2">
            <a
              href={`tel:${phone.replace(/\s+/g, '')}`}
              onClick={handlePhoneClick}
              className={`p-2 rounded-lg transition ${
                isTransparent
                  ? 'text-white bg-white/15 hover:bg-white/25'
                  : 'text-bronze-700 bg-peach-50 hover:bg-peach-100'
              }`}
              aria-label="Hemen Ara"
            >
              <Phone className="w-5 h-5" />
            </a>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-lg focus:outline-none transition ${
                isTransparent
                  ? 'text-white hover:bg-white/15'
                  : 'text-espresso-900 hover:bg-peach-50'
              }`}
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

      {/* Spacer for non-home pages so fixed navbar doesn't overlap content */}
      {!isHomePage && <div className="h-20 lg:h-[84px]" />}
    </>
  );
}
