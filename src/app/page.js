import GigsList from './GigsList';
import '../styles/page.css';

export default function Home() {
  return (
    <div className="page">
      <header className="header">
        <div className="container">
        </div>
      </header>
      <main className="main">
          <img src="/foto-achi.jpg" alt="Logo" className="foto-achi" />
          <h1 className="title">Gigs</h1>
        <div className="container">
          <GigsList />
        </div>
      </main>
    </div>
  );
}
