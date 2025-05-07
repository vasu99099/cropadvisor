
import type { Locale, Translations } from '@/i18n/types';
import { Leaf } from 'lucide-react';

interface FooterProps {
  locale: Locale;
  translations: Translations;
}

export default function Footer({ locale, translations }: FooterProps) {
  const content = translations.footer;
  return (
    <footer className="bg-card-foreground text-primary-foreground py-8 border-t-4 border-primary">
      <div className="container mx-auto px-4 text-center">
        <div className="flex justify-center items-center mb-2">
          <Leaf className="h-6 w-6 text-primary mr-2" />
          <span className="text-lg font-semibold">{translations.appName}</span>
        </div>
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {content.copyrightText}
        </p>
      </div>
    </footer>
  );
}
