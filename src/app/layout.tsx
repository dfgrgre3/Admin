import type { Metadata } from 'next';
import { Alexandria } from 'next/font/google';
import { cookies } from 'next/headers';
import { GlobalProviders } from '@/providers';
import { ThemeProvider } from '@/providers/theme-provider';
import { SWRegistration } from '@/components/sw-registration';
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
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const hasAuthToken = cookieStore.has('access_token') || cookieStore.has('refresh_token') || cookieStore.has('session_id');

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#f97316" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        {/* Inline critical CSS to reduce render-blocking */}
        <style dangerouslySetInnerHTML={{__html: `
          /* Critical above-the-fold styles */
          html{font-family:var(--font-alexandria),var(--font-sans),system-ui,sans-serif;background:hsl(var(--background));color:hsl(var(--foreground))}
          body{min-height:100vh;margin:0}
          /* Prevent FOIT for critical elements */
          h1,h2,h3,h4,h5,h6{font-weight:700;color:hsl(var(--foreground))}
        `}} />
        {/* Preload critical CSS to reduce render-blocking time */}
        <link rel="preload" href="/_next/static/css/app/layout.css" as="style" />
        {/* Defer non-critical CSS - handled by Next.js optimizeCss */}
      </head>
      <body className={`${alexandria.variable} font-sans`} suppressHydrationWarning>
        <SWRegistration />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
          storageKey="tolo-theme"
        >
          <GlobalProviders initialAuthHint={hasAuthToken}>
            {children}
          </GlobalProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}