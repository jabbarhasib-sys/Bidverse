import { useState, useEffect } from 'react';
import axios from 'axios';
import { Auction } from '../types';
import { NoteList } from '../components/NoteList';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/NotesContext';
import { Link, Navigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL;

function SkeletonCard() {
  return (
    <div className="glass p-0 overflow-hidden">
      <div className="skeleton" style={{ height: 200 }} />
      <div className="p-5 space-y-3">
        <div className="skeleton h-5 w-3/4" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-2/3" />
      </div>
    </div>
  );
}

export function MyWins() {
  const { user } = useAuth();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    axios.get(`${API}/api/auctions/won`)
      .then(({ data }) => setAuctions(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const totalSpent = auctions.reduce((acc, a) => acc + a.currentHighestBid, 0);

  return (
    <div className="min-h-screen relative">
      <div className="mesh-bg" />
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-10 page-enter">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="hero-title text-4xl font-extrabold text-white mb-2">
              My <span className="grad-text">Wins</span>
            </h1>
            <p className="text-slate-400">Items you successfully won in auctions.</p>
          </div>
          
          {!loading && auctions.length > 0 && (
            <div className="glass px-5 py-3 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: 'rgba(34,211,238,0.1)', color: '#22d3ee' }}>🏆</div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Total Spent</p>
                <p className="text-xl font-black grad-text">₹{totalSpent.toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : auctions.length === 0 ? (
          <div className="glass p-12 text-center mt-10">
            <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem', opacity: 0.5 }}>🤷‍♂️</span>
            <h2 className="text-xl font-bold text-white mb-2">No wins yet!</h2>
            <p className="text-slate-400 mb-6 max-w-sm mx-auto">You haven't won any auctions yet. Start bidding to see your winnings here.</p>
            <Link to="/" className="btn-primary">Browse Active Auctions</Link>
          </div>
        ) : (
          <NoteList auctions={auctions} />
        )}
      </main>
    </div>
  );
}
