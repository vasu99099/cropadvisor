
import Link from 'next/link';
import LanguageSwitcher from '@/components/language-switcher';
import { Leaf } from 'lucide-react';
import type { Locale, Translations } from '@/i18n/types';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';


interface HeaderProps {
  locale: Locale;
  translations: Translations;
}


export default function Header({ locale, translations }: HeaderProps) {
  const navItems = [
    { href: '#crop-suggestions', label: translations.header.navCropSuggestions },
    { href: '#product-catalog', label: translations.header.navProductCatalog },
    { href: '#disease-stats', label: translations.header.navDiseaseStats },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <Link href={`/${locale}`} className="flex items-center gap-2 group" aria-label={translations.appName}>
          <Leaf className="h-7 w-7 text-primary transition-transform group-hover:rotate-12" />
          <span className="text-xl font-bold text-foreground">{translations.appName}</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navItems.map((item) => (
            <Link key={item.label} href={`/${locale}${item.href}`} className="text-muted-foreground transition-colors hover:text-primary">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher currentLocale={locale} />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px] bg-background p-6">
               <Link href={`/${locale}`} className="flex items-center gap-2 mb-8" aria-label={translations.appName}>
                 <Leaf className="h-7 w-7 text-primary" />
                 <span className="text-xl font-bold text-foreground">{translations.appName}</span>
               </Link>
              <nav className="flex flex-col space-y-3">
                {navItems.map((item) => (
                  <SheetClose asChild key={item.label}>
                    <Link href={`/${locale}${item.href}`} className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
