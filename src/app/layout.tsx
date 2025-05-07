import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';
import './globals.css';
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import {i18n} from '@/i18n/i18n-config';

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale as string }))
}

export const metadata: Metadata = {
  title: 'CropSafe Advisor',
  description: 'Your expert guide to crop protection and pesticide solutions.',
  icons: {
    // While you mentioned not to create a favicon, this is how you would generally add it.
    // icon: "/favicon.ico", 
  },
};

export default function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { lang: string }
}>) {
  return (
    <html lang={params.lang} suppressHydrationWarning>
      <head />
      <body 
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
