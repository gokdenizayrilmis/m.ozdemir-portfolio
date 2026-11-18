import {
  categoryService,
  treatmentService,
  settingsService,
} from '@/services';
import HeroShowcase from '@/components/public/HeroShowcase';
import TreatmentsShowcase from '@/components/public/TreatmentsShowcase';
import DoctorAboutSection from '@/components/public/DoctorAboutSection';
import HealthTourismSection from '@/components/public/HealthTourismSection';
import ContactSection from '@/components/public/ContactSection';

export default async function HomePage() {
  const [categories, treatments, settings] = await Promise.all([
    categoryService.getAll(),
    treatmentService.getAll(),
    settingsService.getSettings(),
  ]);

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. Açılış Sayfası: Tam Ekran Klinik Görseli & Hoş Geldiniz Alanı */}
      <HeroShowcase settings={settings} />

      {/* 2. Tek Bölümde Sekmeli Uzmanlık Branşları & Tüm Klinik Tedaviler Vitrini */}
      <TreatmentsShowcase categories={categories} treatments={treatments} />

      {/* 3. Hakkımda Alanı — Akademik Kariyer & Uzmanlık */}
      <DoctorAboutSection settings={settings} />

      {/* 4. Uluslararası Sağlık Turizmi — Yetki Belgesi & Health Türkiye Profili */}
      <HealthTourismSection settings={settings} />

      {/* 5. İletişim & Konum — Adres, Bilgiler ve Klinik Haritası */}
      <ContactSection settings={settings} />
    </div>
  );
}
