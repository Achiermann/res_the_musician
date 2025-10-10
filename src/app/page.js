import GigsList from './GigsList';
import '../styles/page.css';

export default function Home() {
  return (
    <div className="page">
      <header className="header">
        <div className="container">
          <h1 className="title">Gigs</h1>
        </div>
      </header>
      <main className="main">
        <div className="container">
          <GigsList />
        </div>
      </main>
    </div>
  );
}
