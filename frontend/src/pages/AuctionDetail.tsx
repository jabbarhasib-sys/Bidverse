import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Auction } from '../types';
import { NoteEditor } from '../components/NoteEditor';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const API = import.meta.env.VITE_API_URL;

function SkeletonDetail() {
  return (
    <div className="grid md:grid-cols-2 gap-8 page-enter">
      <div className="space-y-4">
        <div className="skeleton rounded-2xl" style={{ height: 280 }} />
        <div className="skeleton h-7 w-3/4" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-5/6" />
      </div>
      <div className="space-y-4">
        <div className="skeleton rounded-2xl" style={{ height: 140 }} />
        <div className="skeleton rounded-2xl" style={{ height: 180 }} />
      </div>
    </div>
  );
}

export function AuctionDetail() {
  const { id } = useParams<{ id: string }>();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [error, setError]     = useState('');
  const [imgError, setImgError] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!id) return;
    axios.get(`${API}/api/auctions/${id}`)
      .then(({ data }) => setAuction(data))
      .catch(() => setError('Auction not found or has been removed.'));
  }, [id]);

  const live = auction ? auction.status === 'active' && new Date(auction.endTime) > new Date() : false;

  const handleCloseAuction = async () => {
    if (!auction || !id) return;
    if (!window.confirm("Are you sure you want to close this auction and accept the current highest bid?")) return;
    
    setClosing(true);
    try {
      const { data } = await axios.patch(`${API}/api/auctions/${id}/end`);
      setAuction(data);
      toast('Successfully sold item to the person with highest bid', 'success');
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to close auction', 'error');
    } finally {
      setClosing(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      <div className="mesh-bg" />
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-10 page-enter">
        {/* Back */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors mb-8 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          All Auctions
        </Link>

        {error ? (
          <div className="glass p-12 text-center">
            <span style={{ fontSize: '3rem' }}>🔍</span>
            <h2 className="text-xl font-bold text-white mt-4 mb-2">Auction Not Found</h2>
            <p className="text-slate-400 text-sm mb-6">{error}</p>
            <Link to="/" className="btn-primary">Browse Auctions</Link>
          </div>
        ) : !auction ? (
          <SkeletonDetail />
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left: Auction details */}
            <div>
              {/* Image */}
              <div className="rounded-2xl overflow-hidden mb-6 relative" style={{ minHeight: 280 }}>
                {auction.imageUrl && !imgError ? (
                  <>
                    <img
                      src={auction.imageUrl}
                      alt={auction.productName}
                      className="w-full h-72 object-cover"
                      onError={() => setImgError(true)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#070b14]/80 via-transparent to-transparent" />
                  </>
                ) : (
                  <div className="h-72 flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}>
                    <span style={{ fontSize: '4rem', opacity: 0.3 }}>🏷️</span>
                  </div>
                )}
                {/* Status overlay */}
                <div className="absolute top-4 left-4">
                  {live
                    ? <span className="badge-live">Live</span>
                    : <span className="badge-ended">Ended</span>
                  }
                </div>
              </div>

              {/* Details card */}
              <div className="glass p-6">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <h1 className="text-2xl font-extrabold text-white leading-tight">
                    {auction.productName}
                  </h1>
                </div>

                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  {auction.description}
                </p>

                <div className="space-y-3 border-t border-[rgba(99,179,237,0.08)] pt-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Listed by</span>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white text-xs font-black">
                        {auction.createdBy.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-semibold text-slate-300">{auction.createdBy.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {live ? 'Auction Ends' : 'Auction Ended'}
                    </span>
                    <span className="text-sm font-semibold text-slate-300">
                      {new Date(auction.endTime).toLocaleString('en-IN', {
                        dateStyle: 'medium', timeStyle: 'short',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Starting Price</span>
                    <span className="text-sm font-semibold text-slate-300">₹{auction.startingPrice.toLocaleString()}</span>
                  </div>
                </div>

                {/* Creator Actions */}
                {live && user && user._id === auction.createdBy._id && (
                  <div className="mt-6 pt-4 border-t border-[rgba(251,113,133,0.15)] text-center">
                    <button 
                      onClick={handleCloseAuction}
                      disabled={closing}
                      className="btn-primary w-full py-3 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 border-rose-400"
                    >
                      {closing ? 'Closing...' : 'Close Auction & Accept Bid'}
                    </button>
                    <p className="text-xs text-rose-300 mt-2 opacity-80">You can manually close the auction early to accept the current highest bid.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Bidding panel */}
            <div>
              <NoteEditor auction={auction} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
