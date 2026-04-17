import SEO from '../components/SEO';
import Hero from '../sections/Hero/Hero';
import Problem from '../sections/Problem/Problem';
import Solution from '../sections/Solution/Solution';
import Features from '../sections/Features/Features';
import HowItWorks from '../sections/HowItWorks/HowItWorks';
import Demo from '../sections/Demo/Demo';
import FAQ from '../sections/FAQ/FAQ';
import { FAQS } from '../sections/FAQ/faqData';
import CTA from '../sections/CTA/CTA';
import { siteConfig } from '../lib/siteConfig';
import {
  organizationSchema,
  medicalWebPageSchema,
  faqPageSchema,
  softwareApplicationSchema,
  breadcrumbSchema,
} from '../lib/seo';

export default function Home() {
  const schemas = [
    organizationSchema(),
    softwareApplicationSchema(),
    medicalWebPageSchema({
      url: siteConfig.url,
      title: `${siteConfig.name} - ${siteConfig.tagline}`,
      description: siteConfig.longDesc,
    }),
    faqPageSchema(FAQS),
    breadcrumbSchema([{ name: 'Home', url: siteConfig.url }]),
  ];

  return (
    <>
      <SEO
        title={null}
        description={siteConfig.longDesc}
        path="/"
        type="website"
        jsonLd={schemas}
      />
      <Hero />
      <Problem />
      <Solution />
      <Features />
      <HowItWorks />
      <Demo />
      <FAQ />
      <CTA />
    </>
  );
}
