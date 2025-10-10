'use client';

import '../styles/main.css';
import { Toaster } from 'react-hot-toast';
import { Cormorant_Garamond } from 'next/font/google';

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
      </body>
    </html>
  );
}
