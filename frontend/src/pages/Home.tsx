import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Auction } from '../types';
import { NoteList } from '../components/NoteList';
import { SearchBar } from '../components/SearchBar';
import { TagFilter } from '../components/TagFilter';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const API = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

function StatCard({ value, label, icon }: { value: string | number; label: string; icon: string }) {
  return (
    <div className="glass p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
        style={{ background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.15)' }}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-black grad-text">{value}</p>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">{label}</p>
      </div>
    </div>
  );
}

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

export function Home() {
  const { user } = useAuth();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [query, setQuery]       = useState('');
  const [filter, setFilter]     = useState('all');
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    axios.get(`${API}/api/auctions`)
      .then(({ data }) => setAuctions(data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return auctions.filter((a) => {
      const matchQ = !q || a.productName.toLowerCase().includes(q) || a.description.toLowerCase().includes(q);
      const matchF = filter === 'all' || a.status === filter;
      return matchQ && matchF;
    });
  }, [auctions, query, filter]);

  const liveCount   = auctions.filter((a) => a.status === 'active').length;
  const endedCount  = auctions.filter((a) => a.status !== 'active').length;
  const totalBidVal = auctions.reduce((acc, a) => acc + a.currentHighestBid, 0);

  return (
    <div className="min-h-screen relative">
      <div className="mesh-bg" />
      <Navbar />

      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-6 pt-16 pb-10 page-enter">
        {/* Decorative orbs */}
        <div className="orb w-80 h-80 -top-40 -left-40 opacity-30"
          style={{ background: 'radial-gradient(circle, #22d3ee, transparent 70%)' }} />
        <div className="orb w-64 h-64 -top-20 right-0 opacity-20"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 70%)', animationDelay: '4s' }} />

        <div className="relative z-10 mb-12">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 mb-5 px-4 py-2 rounded-full"
            style={{ background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.2)' }}>
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
              {liveCount} Live Auctions Now
            </span>
          </div>

          <h1 className="hero-title text-5xl md:text-6xl lg:text-7xl text-white mb-4 leading-[1.08]">
            Bid on the <br />
            <span className="grad-text">Extraordinary</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
            Real-time auction platform where every second counts. Discover exclusive items,
            place bids instantly, and win with confidence.
          </p>

          {!user && (
            <div className="flex items-center gap-4 mt-8 flex-wrap">
              <Link to="/register" className="btn-primary text-base px-8 py-4">
                Start Bidding Free →
              </Link>
              <Link to="/login" className="btn-ghost text-base px-8 py-4">
                Sign In
              </Link>
            </div>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <StatCard value={liveCount}  label="Live Auctions"   icon="⚡" />
          <StatCard value={endedCount} label="Completed"       icon="🏁" />
          <StatCard value={`₹${(totalBidVal/1000).toFixed(1)}K`} label="Total Bid Value" icon="💰" />
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pb-20">
        {/* Search & Filter Bar */}
        <div className="glass p-4 mb-8 flex flex-col sm:flex-row gap-3">
          <SearchBar value={query} onChange={setQuery} placeholder="Search rare items, collectibles..." />
          <TagFilter active={filter} onChange={setFilter} />
        </div>

        {/* Results header */}
        {!loading && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-slate-400">
              Showing <span className="text-white font-semibold">{filtered.length}</span> auctions
              {query && <> for "<span className="text-cyan-400">{query}</span>"</>}
            </p>
          </div>
        )}

        {/* Auction Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <NoteList auctions={filtered} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[rgba(99,179,237,0.08)] py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-bold grad-text" style={{ fontFamily: "'Syne', sans-serif" }}>
            BidVerse
          </p>
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} BidVerse. Real-time auction platform.
          </p>
        </div>
      </footer>
    </div>
  );
}
