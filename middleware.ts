
import { NextResponse, type NextRequest } from 'next/server';
import { i18n } from './src/i18n/i18n-config';
import type { Locale } from './src/i18n/types';
import { match as matchLocale } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';

function getLocale(request: NextRequest): Locale {
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

  const locales: Locale[] = i18n.locales as Locale[]; // Use the defined Locale type
  const defaultLocale = i18n.defaultLocale;

  // @ts-ignore
  let languages = new Negotiator({ headers: negotiatorHeaders }).languages(locales);
  
  try {
    return matchLocale(languages, locales, defaultLocale) as Locale;
  } catch (e) {
    // Fallback to default locale if matching fails
    return defaultLocale;
  }
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request);

    // Construct the new URL, ensuring no double slashes if pathname is "/"
    const newPath = pathname === '/' ? `/${locale}` : `/${locale}${pathname}`;
    
    return NextResponse.redirect(
      new URL(newPath, request.url)
    );
  }
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/` and static assets
  matcher: ['/((?!api|_next/static|_next/image|images|assets|favicon.ico|sw.js).*)'],
};
