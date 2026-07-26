import type { Metadata, Viewport } from 'next';
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
  const cookieStore = await cookies();
  const hasAuthToken = cookieStore.has('access_token') || cookieStore.has('refresh_token') || cookieStore.has('session_id');

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        {/* No font preconnects: next/font/google self-hosts fonts at build time. */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
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
