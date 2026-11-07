import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Roboto, Kantumruy_Pro } from 'next/font/google';
import '@/styles/globals.css';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/components/auth/auth-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { I18nProvider } from '@/components/i18n-provider';
import { RegisterServiceWorker } from '@/components/pwa/register-sw';

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
});

const kantumruyPro = Kantumruy_Pro({
  subsets: ['khmer', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-khmer',
});

export const metadata: Metadata = {
  title: 'AI Slide Studio · Precision Engine',
  description:
    'Transform any idea into an animated keynote deck with structured Gemini AI outlines, GSAP motion, and 100% offline standalone HTML export.',
  applicationName: 'SlideStudio',
  appleWebApp: {
    capable: true,
    title: 'SlideStudio',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: [
      { url: '/icons/icon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon.ico' },
    ],
    apple: { url: '/icons/apple-touch-icon.png', sizes: '180x180' },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0f0d0c' },
    { media: '(prefers-color-scheme: light)', color: '#fafaf9' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${roboto.variable} ${kantumruyPro.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('slidestudio_theme') || 'dark';
                  var isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                  var locale = localStorage.getItem('slidestudio_locale') || 'en';
                  document.documentElement.lang = locale === 'kh' ? 'km' : 'en';
                  document.documentElement.setAttribute('data-lang', locale);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen font-sans bg-background text-foreground antialiased selection:bg-brand/30 selection:text-brand">
        <ThemeProvider defaultTheme="dark">
          <I18nProvider>
            <AuthProvider>
              {children}
              <RegisterServiceWorker />
              <Toaster position="bottom-right" richColors />
            </AuthProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
