import AdminPanel from './AdminPanel';
import Link from 'next/link';
import '../../styles/page.css';

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
    <div className="page">
          <Link href="/" className="admin-back-button">Go Back</Link>
      <header className="header">
        <div className="container">
          <h1 className="title">Gigs Admin</h1>
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
