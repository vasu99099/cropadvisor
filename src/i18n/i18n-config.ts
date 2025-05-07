
import type { I18nConfig, Locale } from './types';

export const i18n: I18nConfig = {
  defaultLocale: 'en',
  locales: ['en', 'gu', 'es', 'fr'] as Locale[], // Cast to Locale[]
} as const;
