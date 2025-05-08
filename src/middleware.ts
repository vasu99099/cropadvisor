
import { NextResponse, type NextRequest } from 'next/server';
import { i18n } from './i18n/i18n-config';
import type { Locale } from './i18n/types';
import { match as matchLocale } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';

function getLocale(request: NextRequest): Locale {
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

  // Ensure arrays passed to libraries are plain string arrays
  const availableLocales: string[] = [...i18n.locales]; 
  const defaultLocaleString: string = i18n.defaultLocale;

  let preferredLanguages: string[];
  try {
    const negotiator = new Negotiator({ headers: negotiatorHeaders });
    preferredLanguages = negotiator.languages(availableLocales);
  } catch (error) {
    console.error("[Middleware] Negotiator error:", error, "- Falling back to default locale:", i18n.defaultLocale);
    return i18n.defaultLocale; 
  }
  
  try {
    // matchLocale expects string arrays and a string default
    return matchLocale(preferredLanguages, availableLocales, defaultLocaleString) as Locale;
  } catch (error) {
    console.error("[Middleware] matchLocale error:", error, "- Falling back to default locale:", i18n.defaultLocale);
    return i18n.defaultLocale; 
  }
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  console.log(`[Middleware] Pathname: ${pathname}`);

  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request);
    // console.log(`[Middleware] Detected locale: ${locale} for pathname: ${pathname}`);
    
    // Construct the new URL, ensuring no double slashes if pathname is "/"
    const newPath = pathname === '/' ? `/${locale}` : `/${locale}${pathname}`;
    // console.log(`[Middleware] Redirecting from ${pathname} to ${newPath}`);
    
    return NextResponse.redirect(
      new URL(newPath, request.url)
    );
  }
  // console.log(`[Middleware] No redirect needed for ${pathname}`);
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/` and static assets
  matcher: ['/((?!api|_next/static|_next/image|images|assets|favicon.ico|sw.js).*)'],
};

