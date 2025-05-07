
"use client";

import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { Locale } from '@/i18n/types';
import { useRouter, usePathname } from 'next/navigation';

interface LanguageSwitcherProps {
  currentLocale: Locale;
}

const locales: { code: Locale; name: string }[] = [
  { code: 'en', name: 'English' },
  { code: 'gu', name: 'ગુજરાતી' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
];

export default function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: Locale) => {
    const newPath = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
    router.push(newPath);
    router.refresh(); // Required to re-fetch dictionary for new locale
  };
  
  const currentLanguageName = locales.find(l => l.code === currentLocale)?.name || 'Language';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Change language">
          <Globe className="h-[1.2rem] w-[1.2rem]" />
           <span className="sr-only">{currentLanguageName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale.code}
            onClick={() => handleLanguageChange(locale.code)}
            disabled={locale.code === currentLocale}
            className="cursor-pointer"
          >
            {locale.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
