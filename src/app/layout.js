import '../styles/main.css';
import { Toaster } from 'react-hot-toast';
import { Cormorant_Garamond } from 'next/font/google';
import ServiceWorkerRegister from './components/serviceWorkerRegister';

export const metadata = {
    title: { default: "Gigs", template: "%s | Gigs" },
    description: "Add gigs",
    themeColor: "#ffffff",
    manifest: "/manifest.json",
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
