import { FaqItem, SiteSettings, Treatment, BlogPost } from '@/types';

interface JsonLdProps {
  type: 'Clinic' | 'Treatment' | 'Blog';
  settings?: SiteSettings | null;
  treatment?: Treatment;
  blog?: BlogPost;
  url?: string;
}

export default function JsonLdSchema({
  type,
  settings,
  treatment,
  blog,
  url = 'https://drmustafaozdemir.com',
}: JsonLdProps) {
  const schemas: object[] = [];

  // 1. Clinic & Physician Schema (Base)
  const clinicSchema = {
    '@context': 'https://schema.org',
    '@type': ['MedicalClinic', 'Physician'],
    '@id': `${url}/#clinic`,
    name: settings?.clinicName || 'Prof. Dr. Mustafa Özdemir Dermatoloji Kliniği',
    alternateName: 'Prof. Dr. Mustafa Özdemir',
    url: url,
    telephone: settings?.phoneNumbers?.[0] || '+905522656436',
    email: settings?.email || 'mustafaozdemir@yahoo.com',
    priceRange: '$$',
    medicalSpecialty: [
      'https://schema.org/Dermatology',
      'https://schema.org/MedicalSpecialty',
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress:
        settings?.address ||
        'Ataköy 7-8-9-10. Kısım Mah. Çobançeşme E-5 Yanyol Cad. Ataköy Towers B-Blok No:146',
      addressLocality: 'Bakırköy',
      addressRegion: 'İstanbul',
      postalCode: '34158',
      addressCountry: 'TR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '40.9895',
      longitude: '28.8315',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
        ],
        opens: '09:30',
        closes: '19:00',
      },
    ],
  };

  schemas.push(clinicSchema);

  // 2. Treatment MedicalWebPage Schema
  if (type === 'Treatment' && treatment) {
    const treatmentSchema = {
      '@context': 'https://schema.org',
      '@type': 'MedicalWebPage',
      name: treatment.title,
      description: treatment.summary,
      url: `${url}/${treatment.slug}`,
      about: {
        '@type': 'MedicalProcedure',
        name: treatment.title,
        procedureType: 'https://schema.org/NoninvasiveProcedure',
      },
      provider: {
        '@id': `${url}/#clinic`,
      },
    };
    schemas.push(treatmentSchema);

    // 3. Google FAQPage Schema
    if (treatment.faqs && treatment.faqs.length > 0) {
      const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: treatment.faqs.map((faq: FaqItem) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      };
      schemas.push(faqSchema);
    }
  }

  // 4. Blog MedicalScholarlyArticle Schema
  if (type === 'Blog' && blog) {
    const blogSchema = {
      '@context': 'https://schema.org',
      '@type': 'MedicalScholarlyArticle',
      headline: blog.title,
      description: blog.summary,
      author: {
        '@type': 'Person',
        name: blog.author || 'Prof. Dr. Mustafa Özdemir',
      },
      publisher: {
        '@id': `${url}/#clinic`,
      },
      datePublished: blog.publishedAt,
      dateModified: blog.updatedAt || blog.publishedAt,
    };
    schemas.push(blogSchema);
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
    />
  );
}

