'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Category, SiteSettings } from '@/types';
import { Phone, MessageCircle, Menu, X, ChevronDown } from 'lucide-react';
import { trackConversionClick } from '@/hooks/use-utm-tracker';
import { createWhatsAppUrl } from '@/utils/cn';

interface HeaderProps {
  categories: Category[];
  settings: SiteSettings | null;
}

export default function Header({ categories, settings }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [treatmentsDropdown, setTreatmentsDropdown] = useState(false);

  const phone = settings?.phoneNumbers?.[0] || '+90 552 265 64 36';
  const whatsappNumber = settings?.whatsAppNumber || '905522656436';
  const waUrl = createWhatsAppUrl(whatsappNumber);

  const handlePhoneClick = () => {
    trackConversionClick('PhoneClick', window.location.pathname);
  };

  const handleWhatsAppClick = () => {
    trackConversionClick('WhatsAppClick', window.location.pathname);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all">
      {/* Top Bar for Desktop */}
      <div className="hidden lg:block bg-slate-900 text-slate-300 text-xs py-2">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <span>Ataköy Towers B-Blok No:146, Bakırköy / İstanbul</span>
            <span className="text-slate-500">•</span>
            <span>Çalışma Saatleri: Pzt - Cmt 09:30 - 19:00</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={`tel:${phone.replace(/\s+/g, '')}`}
              onClick={handlePhoneClick}
              className="flex items-center gap-1.5 hover:text-white transition"
            >
              <Phone className="w-3.5 h-3.5 text-amber-500" />
              <span>{phone}</span>
            </a>
            <span className="text-slate-600">|</span>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleWhatsAppClick}
              className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-medium transition"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp Randevu</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link href="/" className="flex flex-col">
          <span className="text-xl sm:text-2xl font-serif font-bold text-slate-900 tracking-tight">
            Prof. Dr. Mustafa Özdemir
          </span>
          <span className="text-xs uppercase tracking-widest text-amber-700 font-semibold mt-0.5">
            Dermatoloji & Lazer Kliniği
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-700">
          <Link href="/" className="hover:text-amber-700 transition">
            Ana Sayfa
          </Link>
          <Link href="/hakkimizda" className="hover:text-amber-700 transition">
            Hakkımızda
          </Link>

          {/* Categories Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setTreatmentsDropdown(true)}
            onMouseLeave={() => setTreatmentsDropdown(false)}
          >
            <button className="flex items-center gap-1 hover:text-amber-700 transition py-2">
              <span>Tedaviler & Hizmetler</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {treatmentsDropdown && (
              <div className="absolute top-full left-0 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/kategori/${cat.slug}`}
                    className="block px-4 py-2.5 hover:bg-slate-50 text-slate-700 hover:text-amber-800 transition font-normal"
                    onClick={() => setTreatmentsDropdown(false)}
                  >
                    {cat.title}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/blog" className="hover:text-amber-700 transition">
            Blog & Makaleler
          </Link>
          <Link href="/iletisim" className="hover:text-amber-700 transition">
            İletişim
          </Link>
        </nav>

        {/* Desktop CTA Action */}
        <div className="hidden lg:flex items-center gap-3">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWhatsAppClick}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-sm transition hover:shadow-md"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp ile İletişim</span>
          </a>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex lg:hidden items-center gap-2">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWhatsAppClick}
            className="p-2 text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100"
            aria-label="WhatsApp"
          >
            <MessageCircle className="w-5 h-5" />
          </a>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 rounded-lg hover:bg-slate-100 focus:outline-none"
            aria-label="Menü"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-6 py-6 shadow-xl space-y-4">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-semibold text-slate-800 hover:text-amber-700"
          >
            Ana Sayfa
          </Link>
          <Link
            href="/hakkimizda"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-semibold text-slate-800 hover:text-amber-700"
          >
            Prof. Dr. Mustafa Özdemir Kimdir?
          </Link>

          <div className="border-t border-slate-100 pt-3">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
              Tedavi Kategorileri
            </span>
            <div className="mt-2 space-y-2">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/kategori/${cat.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm text-slate-600 hover:text-amber-700 pl-2"
                >
                  • {cat.title}
                </Link>
              ))}
            </div>
          </div>

          <Link
            href="/blog"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-semibold text-slate-800 hover:text-amber-700 border-t border-slate-100 pt-3"
          >
            Blog & Sağlık Rehberi
          </Link>
          <Link
            href="/iletisim"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-semibold text-slate-800 hover:text-amber-700"
          >
            İletişim & Randevu
          </Link>

          <div className="pt-4 flex flex-col gap-3">
            <a
              href={`tel:${phone.replace(/\s+/g, '')}`}
              onClick={handlePhoneClick}
              className="flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-xl font-medium"
            >
              <Phone className="w-4 h-4 text-amber-500" />
              <span>Hemen Ara: {phone}</span>
            </a>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleWhatsAppClick}
              className="flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-medium"
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

