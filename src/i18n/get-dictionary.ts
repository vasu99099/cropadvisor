
import 'server-only';
import type { Locale, Translations } from './types';

const dictionaries: Record<Locale, () => Promise<Translations>> = {
  en: () => import('./locales/en.json').then((module) => module.default),
  gu: () => import('./locales/gu.json').then((module) => module.default),
  es: () => import('./locales/es.json').then((module) => module.default),
  fr: () => import('./locales/fr.json').then((module) => module.default),
};

export const getDictionary = async (locale: Locale): Promise<Translations> => {
  const loader = dictionaries[locale] || dictionaries.en; // Fallback to English if locale is not found
  try {
    return await loader();
  } catch (error) {
    console.warn(`Dictionary for locale "${locale}" not found, falling back to English.`, error);
    return await dictionaries.en();
  }
};
