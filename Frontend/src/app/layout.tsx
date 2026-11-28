import type { Metadata } from 'next';
import './globals.css';

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://drmustafaozdemir.com'
).replace(/\/$/, '');

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Prof. Dr. Mustafa Özdemir | Dermatoloji & Lazer Kliniği Bakırköy',
    template: '%s | Prof. Dr. Mustafa Özdemir',
  },
  description:
    'İstanbul Bakırköy Ataköy Towers\'ta Prof. Dr. Mustafa Özdemir kliniğinde akne, leke, lazer tedavileri, ben taraması, HPV genital siğil ve saç hastalıkları tedavisi.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="min-h-screen flex flex-col selection:bg-amber-100 selection:text-amber-900 font-sans">
        {children}
      </body>
    </html>
  );
}

