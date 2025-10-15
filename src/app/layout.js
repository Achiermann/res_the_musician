import '../styles/main.css';
import { Toaster } from 'react-hot-toast';
import { Cormorant_Garamond } from 'next/font/google';
import ServiceWorkerRegister from './components/serviceWorkerRegister';


export const metadata = {
  title: { default: 'Gigs', template: '%s | Gigs' },
  description: 'Add gigs',
  themeColor: '#ffffff',
  manifest: '/manifest.json',

  // iOS PWA bits:
  appleWebApp: {
    capable: true,                
    statusBarStyle: 'black-translucent', 
    title: 'Gigs',    
  },
  icons: {
    // iOS reads this, not the manifest
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' }, // recommended
    ],
    // (optional) favicons etc.
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
  },
};

// Viewport meta with safe-area support
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover', // <meta name="viewport" content="... , viewport-fit=cover">
};


const cormorantGaramond = Cormorant_Garamond({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={cormorantGaramond.className}>
        {children}
        <Toaster position="top-right" />
                <ServiceWorkerRegister />
      </body>
    </html>
  );
}
