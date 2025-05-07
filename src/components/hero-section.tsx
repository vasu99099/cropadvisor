
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Locale, Translations } from '@/i18n/types';
import { ShieldCheck, Trees, TestTubeDiagonal } from 'lucide-react';

interface HeroSectionProps {
  locale: Locale;
  translations: Translations;
}

export default function HeroSection({ locale, translations }: HeroSectionProps) {
  const content = translations.hero;

  return (
    <section className="relative bg-gradient-to-br from-secondary via-background to-background py-16 md:py-24 lg:py-32 overflow-hidden">
       <div className="absolute inset-0 opacity-10">
        {/* Decorative background SVGs or elements could go here for more texture */}
         <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsl(var(--primary) / 0.2)" strokeWidth="0.5"/></pattern></defs><rect width="100%" height="100%" fill="url(#smallGrid)" /></svg>
      </div>
      <div className="container mx-auto px-4 z-10 relative">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-6 leading-tight">
              {content.titleLine1} <span className="text-primary drop-shadow-sm">{content.titleHighlight}</span> {content.titleLine2}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto md:mx-0">
              {content.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-transform hover:scale-105 focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2">
                <Link href={`/${locale}#crop-suggestions`}>
                  <TestTubeDiagonal className="mr-2 h-5 w-5" />
                  {content.ctaGetSuggestions}
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="shadow-lg transition-transform hover:scale-105 border-primary text-primary hover:bg-primary/10 focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2">
                <Link href={`/${locale}#product-catalog`}>
                  <Trees className="mr-2 h-5 w-5" />
                  {content.ctaViewCatalog}
                </Link>
              </Button>
            </div>
          </div>
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-2xl order-first md:order-last group">
            <Image
              src="https://picsum.photos/800/600"
              alt={content.imageAlt}
              fill
              style={{ objectFit: 'cover' }}
              priority
              className="transform transition-transform duration-500 group-hover:scale-105"
              data-ai-hint="agriculture farm field"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
             <div className="absolute bottom-5 left-5 text-white p-3 bg-black/40 rounded-lg backdrop-blur-sm">
              <ShieldCheck className="inline h-5 w-5 mr-2 text-primary" /> 
              <span className="text-sm font-medium">{content.imageCaption}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
