import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono, Poppins } from 'next/font/google';

import { Providers } from '@/providers';
import '@/styles/globals.css';

// Font configurations
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
  preload: true,
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
  preload: true,
});

// Metadata configuration
export const metadata: Metadata = {
  title: {
    default: 'IntelliChat Pro',
    template: '%s | IntelliChat Pro',
  },
  description: 'AI-powered chat interface with advanced features and intuitive design',
  keywords: [
    'AI chat',
    'artificial intelligence',
    'chatbot',
    'conversation',
    'machine learning',
    'natural language processing',
  ],
  authors: [
    {
      name: 'IntelliChat Team',
    },
  ],
  creator: 'IntelliChat Team',
  publisher: 'IntelliChat',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'IntelliChat Pro',
    title: 'IntelliChat Pro - AI-Powered Chat Interface',
    description: 'Experience the future of AI conversation with IntelliChat Pro',
    images: [
      {
        url: '/images/logo.svg',
        width: 1200,
        height: 630,
        alt: 'IntelliChat Pro',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@intellichat',
    creator: '@intellichat',
    title: 'IntelliChat Pro - AI-Powered Chat Interface',
    description: 'Experience the future of AI conversation with IntelliChat Pro',
    images: ['/twitter-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/images/logo.svg', type: 'image/svg+xml', sizes: '32x32' },
    ],
    apple: [
      { url: '/images/logo.svg', sizes: '180x180', type: 'image/svg+xml' },
    ],
    other: [
      { url: '/images/logo.svg', sizes: '192x192', type: 'image/svg+xml' },
    ],
  },
  manifest: '/site.webmanifest',
};

// Viewport configuration
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0d1117' },
  ],
  colorScheme: 'dark light',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${jetbrainsMono.variable} ${poppins.variable}`}
      suppressHydrationWarning
    >
      <body
        className="min-h-screen bg-background font-sans antialiased"
        suppressHydrationWarning
      >
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <div className="flex-1">{children}</div>
          </div>
        </Providers>
        
        {/* Service Worker Registration */}
        {process.env.NODE_ENV === 'production' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js')
                      .then(function(registration) {
                        console.log('SW registered: ', registration);
                      })
                      .catch(function(registrationError) {
                        console.log('SW registration failed: ', registrationError);
                      });
                  });
                }
              `,
            }}
          />
        )}
      </body>
    </html>
  );
}
