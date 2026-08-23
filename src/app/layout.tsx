import type { Metadata, Viewport } from 'next';
import { Alexandria } from 'next/font/google';
import { GlobalProviders } from '@/providers';
import { ThemeProvider } from '@/providers/theme-provider';
import { SWRegistration } from '@/components/sw-registration';
import { DeferredStyles } from '@/components/deferred-styles';
import './globals.css';

const alexandria = Alexandria({
  subsets: ['arabic', 'latin'],
  variable: '--font-alexandria',
  display: 'swap',
  preload: true,
  weight: ['400', '700'],
  adjustFontFallback: true,
  fallback: ['system-ui', 'sans-serif'],
});

export const metadata: Metadata = {
  title: { default: 'لوحة التحكم | Tolo', template: '%s | Tolo' },
  description: 'لوحة التحكم وإدارة نظام Tolo التعليمي',
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    siteName: 'Tolo',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#f97316',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // NOTE: This layout intentionally does NOT call `cookies()`/`headers()`.
  // Calling a Request–time (dynamic) API in the root layout forces the *entire*
  // App Router tree to render dynamically on every request, which disables
  // static caching and `<Link>` prefetching — the main cause of slow navigation
  // and repeated re-renders. Session presence is instead detected client-side
  // in `AuthProvider` (cookie / localStorage token), while the edge middleware
  // remains the authoritative security gate for `/admin*` and `/api/admin`.
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className="efficiency-mode">
      <head>
        {/* No font preconnects: next/font/google self-hosts fonts at build time. */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${alexandria.variable} font-sans`} suppressHydrationWarning>
        <DeferredStyles />
        <SWRegistration />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
          storageKey="tolo-theme"
        >
          <GlobalProviders>
            {children}
          </GlobalProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
