
import Header from '@/components/header';
import HeroSection from '@/components/hero-section';
import CropPesticideSuggester from '@/components/crop-pesticide-suggester';
import PlantDiseaseIdentifier from '@/components/plant-disease-identifier'; // New import
import ProductCatalog from '@/components/product-catalog';
import DiseaseStats from '@/components/disease-stats';
import Footer from '@/components/footer';
import { getDictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/types';
import { i18n } from '@/i18n/i18n-config';

interface HomePageProps {
  params: {
    lang: Locale;
  };
}

// This enables static site generation for all locales
export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}


export default async function HomePage({ params: { lang } }: HomePageProps) {
  const dictionary = await getDictionary(lang);

  return (
    <div className="flex flex-col min-h-screen">
      <Header locale={lang} translations={dictionary} />
      <main className="flex-grow">
        <HeroSection locale={lang} translations={dictionary} />
        <CropPesticideSuggester locale={lang} translations={dictionary} />
        <PlantDiseaseIdentifier locale={lang} translations={dictionary} /> {/* New Component */}
        <ProductCatalog locale={lang} translations={dictionary} />
        <DiseaseStats locale={lang} translations={dictionary} />
      </main>
      <Footer locale={lang} translations={dictionary} />
    </div>
  );
}
