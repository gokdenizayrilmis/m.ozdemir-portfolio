import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import StickyMobileBar from '@/components/public/StickyMobileBar';
import JsonLdSchema from '@/components/public/JsonLdSchema';
import UtmInitializer from '@/components/public/UtmInitializer';
import { categoryService, settingsService } from '@/services';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [categories, settings] = await Promise.all([
    categoryService.getAll(),
    settingsService.getSettings(),
  ]);

  const phone = settings?.phoneNumbers?.[0] || '+90 552 265 64 36';
  const whatsappNumber = settings?.whatsAppNumber || '905522656436';

  return (
    <>
      <UtmInitializer />
      <JsonLdSchema type="Clinic" settings={settings} />
      <Header categories={categories} settings={settings} />
      <main className="flex-grow">{children}</main>
      <Footer categories={categories} settings={settings} />
      <StickyMobileBar phone={phone} whatsappNumber={whatsappNumber} />
    </>
  );
}

