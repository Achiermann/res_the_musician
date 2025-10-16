import AdminPanel from './AdminPanel';
import Link from 'next/link';
import '../../styles/page.css';
import '../../styles/admin-panel.css';
import { Ubuntu, Pixelify_Sans } from 'next/font/google';

const ubuntu = Ubuntu({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

const pixelifySans = Pixelify_Sans({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function AdminPage() {
  return (
    <div className={`page admin-page ${ubuntu.className}`}>
          <Link href="/" className="admin-back-button">Go Back</Link>
      <header className="header">
        <div className="container">
          <h1 className={`title ${pixelifySans.className}`}>Gigs Admin</h1>
        </div>
      </header>
      <main className="main">
        <div className="container">
          <AdminPanel />
        </div>
      </main>
    </div>
  );
}
