import { siteConfig } from './siteConfig';

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.organization.name,
    url: siteConfig.organization.url,
    logo: siteConfig.organization.logo,
    sameAs: [siteConfig.social.github, siteConfig.social.discord],
  };
}

export function medicalWebPageSchema({ url, title, description }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: title,
    description,
    url,
    inLanguage: 'en',
    about: {
      '@type': 'MedicalCondition',
      name: 'Diabetes Mellitus',
      code: {
        '@type': 'MedicalCode',
        codeValue: 'E11',
        codingSystem: 'ICD-10',
      },
    },
    audience: {
      '@type': 'MedicalAudience',
      audienceType: 'Patient',
    },
    publisher: organizationSchema(),
  };
}

export function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function faqPageSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a,
      },
    })),
  };
}

export function softwareApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: siteConfig.name,
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Web',
    description: siteConfig.longDesc,
    url: siteConfig.url,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    publisher: organizationSchema(),
  };
}
