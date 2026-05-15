import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { Auction, Bid } from '../types';
import { useAuth } from '../context/NotesContext';
import { useToast } from '../context/ToastContext';
import { Link } from 'react-router-dom';

interface Props { auction: Auction; }

const API = import.meta.env.VITE_API_URL;

function useLiveCountdown(endTime: string) {
  const calc = useCallback(() => {
    const diff = Math.max(0, new Date(endTime).getTime() - Date.now());
    return {
      d: Math.floor(diff / 86_400_000),
      h: Math.floor((diff % 86_400_000) / 3_600_000),
      m: Math.floor((diff % 3_600_000) / 60_000),
      s: Math.floor((diff % 60_000) / 1_000),
      total: diff,
    };
  }, [endTime]);
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, [calc]);
  return time;
}

function DetailCountdown({ endTime }: { endTime: string }) {
  const { d, h, m, s, total } = useLiveCountdown(endTime);
  const urgent = total > 0 && total < 3_600_000;

  if (total === 0) {
    return (
      <div className="glass p-5 text-center" style={{ border: '1px solid rgba(71,85,105,0.4)' }}>
        <p className="text-slate-400 font-semibold">Auction Ended</p>
      </div>
    );
  }

  return (
    <div className="glass p-5">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 text-center">
        ⏱ Time Remaining
      </p>
      <div className="flex items-center justify-center gap-2">
        {d > 0 && (
          <>
            <div className="countdown-digit" style={{ minWidth: 52 }}>
              <span className="digit-val text-2xl">{String(d).padStart(2, '0')}</span>
              <span className="digit-label">days</span>
            </div>
            <span className="text-slate-500 font-bold text-xl pb-3">:</span>
          </>
        )}
        <div className="countdown-digit" style={{
          minWidth: 52,
          borderColor: urgent ? 'rgba(251,113,133,0.4)' : undefined,
        }}>
          <span className="digit-val text-2xl" style={{ color: urgent ? '#fb7185' : undefined }}>
            {String(h).padStart(2, '0')}
          </span>
          <span className="digit-label">hrs</span>
        </div>
        <span className="text-slate-500 font-bold text-xl pb-3">:</span>
        <div className="countdown-digit" style={{
          minWidth: 52,
          borderColor: urgent ? 'rgba(251,113,133,0.4)' : undefined,
        }}>
          <span className="digit-val text-2xl" style={{ color: urgent ? '#fb7185' : undefined }}>
            {String(m).padStart(2, '0')}
          </span>
          <span className="digit-label">min</span>
        </div>
        <span className="text-slate-500 font-bold text-xl pb-3">:</span>
        <div className="countdown-digit" style={{
          minWidth: 52,
          borderColor: urgent ? 'rgba(251,113,133,0.4)' : undefined,
        }}>
          <span className="digit-val text-2xl" style={{ color: urgent ? '#fb7185' : undefined }}>
            {String(s).padStart(2, '0')}
          </span>
          <span className="digit-label">sec</span>
        </div>
      </div>
      {urgent && (
        <p className="text-center text-xs text-rose-400 font-bold mt-3 animate-pulse">
          ⚡ Ending soon – place your bid now!
        </p>
      )}
    </div>
  );
}

function BidRow({ bid, rank }: { bid: Bid; rank: number }) {
  const isTop = rank === 1;
  return (
    <li
      className={`bid-new py-4 px-3 -mx-3 rounded-xl flex justify-between items-center transition-colors hover:bg-[rgba(34,211,238,0.03)]`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
          isTop
            ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30'
            : 'bg-[rgba(34,211,238,0.1)] text-cyan-400'
        }`}>
          {isTop ? '👑' : rank}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-200">{bid.bidder.name}</p>
          <p className="text-xs text-slate-500">
            {new Date(bid.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        </div>
      </div>
      <span className={`text-base font-black ${isTop ? 'grad-text-gold' : 'grad-text'}`}>
        ₹{bid.amount.toLocaleString()}
      </span>
    </li>
  );
}

interface WinnerBanner {
  auctionName: string;
  amount: number;
}

export function NoteEditor({ auction: initial }: Props) {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [auction, setAuction]   = useState<Auction>(initial);
  const [bids, setBids]         = useState<Bid[]>([]);
  const [amount, setAmount]     = useState('');
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [placing, setPlacing]   = useState(false);
  const [newBidFlash, setNewBidFlash] = useState(false);
  const [winnerBanner, setWinnerBanner] = useState<WinnerBanner | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Load bid history
  useEffect(() => {
    axios.get(`${API}/api/bids/${initial._id}`).then(({ data }) => setBids(data));
  }, [initial._id]);

  // Socket.IO
  useEffect(() => {
    const socket = io(API, { auth: { token } });
    socketRef.current = socket;
    socket.emit('join-auction', initial._id);

    // Join personal user room so server can target this user directly
    if (user?._id) socket.emit('join-user', user._id);

    socket.on('new-bid', (payload) => {
      setAuction((prev) => ({
        ...prev,
        currentHighestBid: payload.amount,
        currentHighestBidder: { _id: payload.bidder.id, name: payload.bidder.name },
      }));
      setBids((prev) => [
        {
          _id: payload.bidId,
          auction: initial._id,
          bidder: { _id: payload.bidder.id, name: payload.bidder.name },
          amount: payload.amount,
          createdAt: payload.timestamp,
        },
        ...prev,
      ]);
      setNewBidFlash(true);
      setTimeout(() => setNewBidFlash(false), 800);
    });

    socket.on('auction-ended', () => {
      setAuction((prev) => ({ ...prev, status: 'ended' }));
    });

    // Fired only for the winner when the creator closes the auction early
    socket.on('auction-won', (payload: { auctionId: string; productName: string; finalBid: number }) => {
      // Show full-screen banner
      setWinnerBanner({ auctionName: payload.productName, amount: payload.finalBid });
      // Also fire a persistent toast
      toast(`🏆 You won "${payload.productName}"!`, 'success');
    });

    return () => { socket.emit('leave-auction', initial._id); socket.disconnect(); };
  }, [initial._id, token, user?._id, toast]);

  const placeBid = async () => {
    setError(''); setSuccess('');
    const num = parseFloat(amount);
    if (!num || num <= auction.currentHighestBid) {
      setError(`Enter an amount greater than ₹${auction.currentHighestBid.toLocaleString()}`);
      return;
    }
    setPlacing(true);
    try {
      await axios.post(`${API}/api/bids`, { auctionId: auction._id, amount: num });
      setAmount('');
      setSuccess(`Bid of ₹${num.toLocaleString()} placed successfully!`);
      setTimeout(() => setSuccess(''), 4000);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message ?? 'Failed to place bid. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  const live = auction.status === 'active' && new Date(auction.endTime) > new Date();

  return (
    <div className="space-y-5">
      {/* ── Winner Banner Modal ─────────────────────────────── */}
      {winnerBanner && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(7,11,20,0.85)', backdropFilter: 'blur(12px)' }}
        >
          <div
            className="relative max-w-md w-full rounded-3xl p-8 text-center"
            style={{
              background: 'linear-gradient(135deg, #0f172a, #1e293b)',
              border: '1px solid rgba(251,191,36,0.4)',
              boxShadow: '0 0 60px rgba(251,191,36,0.2)',
            }}
          >
            {/* Confetti rings */}
            <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20"
                style={{ background: 'radial-gradient(circle, #fbbf24, transparent 70%)', filter: 'blur(30px)' }} />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full opacity-20"
                style={{ background: 'radial-gradient(circle, #f59e0b, transparent 70%)', filter: 'blur(30px)' }} />
            </div>

            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-2xl font-black text-white mb-2">Congratulations!</h2>
            <p className="text-slate-300 mb-1 text-sm">You won the auction for</p>
            <p className="text-xl font-extrabold mb-3" style={{ color: '#fbbf24' }}>
              {winnerBanner.auctionName}
            </p>
            {winnerBanner.amount > 0 && (
              <p className="text-slate-400 text-sm mb-6">
                Final bid: <span className="text-white font-bold">₹{winnerBanner.amount.toLocaleString()}</span>
              </p>
            )}
            <button
              id="winner-dismiss-btn"
              onClick={() => setWinnerBanner(null)}
              className="btn-primary w-full py-3"
            >
              🎉 Claim My Win!
            </button>
          </div>
        </div>
      )}
      {/* Current Bid Panel */}
      <div className="glass relative overflow-hidden p-6">
        {/* Glow blob */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #22d3ee, transparent 70%)', filter: 'blur(30px)' }} />

        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 relative z-10">
          Current Highest Bid
        </p>
        <p
          className={`text-5xl font-black text-white relative z-10 tracking-tight transition-all ${
            newBidFlash ? 'num-flash' : ''
          }`}
        >
          <span className="grad-text">₹{auction.currentHighestBid.toLocaleString()}</span>
        </p>
        {auction.currentHighestBidder && (
          <p className="text-sm text-slate-400 mt-3 relative z-10 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            Leading bid by{' '}
            <span className="text-emerald-300 font-semibold">{auction.currentHighestBidder.name}</span>
          </p>
        )}
      </div>

      {/* Countdown */}
      {live && <DetailCountdown endTime={auction.endTime} />}

      {/* Place Bid */}
      {live && user ? (
        <div className="glass p-6">
          <p className="text-sm font-bold text-white uppercase tracking-wider mb-4">
            💸 Place Your Bid
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="bid-input-wrap flex-1">
              <span className="currency-sym">₹</span>
              <input
                id="bid-amount-input"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && placeBid()}
                placeholder={`> ${auction.currentHighestBid.toLocaleString()}`}
                aria-label="Bid amount"
                className="input-field"
                min={auction.currentHighestBid + 1}
              />
            </div>
            <button
              id="place-bid-btn"
              onClick={placeBid}
              disabled={placing}
              className="btn-primary px-8 py-3 whitespace-nowrap"
            >
              {placing ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Placing…
                </span>
              ) : '⚡ Submit Bid'}
            </button>
          </div>

          {/* Quick bid buttons */}
          <div className="flex gap-2 mt-3 flex-wrap">
            {[100, 500, 1000, 5000].map((inc) => (
              <button
                key={inc}
                type="button"
                onClick={() => setAmount(String(auction.currentHighestBid + inc))}
                className="text-xs px-3 py-1.5 rounded-lg border border-[rgba(34,211,238,0.2)] text-cyan-400 hover:bg-[rgba(34,211,238,0.08)] transition-all font-semibold"
              >
                +₹{inc.toLocaleString()}
              </button>
            ))}
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-3 p-3 rounded-xl"
              style={{ background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.3)' }}>
              <span className="text-rose-400 flex-shrink-0">⚠</span>
              <p className="text-sm text-rose-300">{error}</p>
            </div>
          )}
          {success && (
            <div className="mt-4 flex items-center gap-3 p-3 rounded-xl"
              style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)' }}>
              <span className="text-emerald-400 flex-shrink-0">✓</span>
              <p className="text-sm text-emerald-300">{success}</p>
            </div>
          )}
        </div>
      ) : !user ? (
        <div className="glass p-6 text-center"
          style={{ background: 'rgba(34,211,238,0.04)', border: '1px solid rgba(34,211,238,0.12)' }}>
          <p className="text-2xl mb-3">🔐</p>
          <p className="text-slate-400 mb-4 text-sm">Sign in to place a bid on this auction.</p>
          <div className="flex gap-3 justify-center">
            <Link to="/login" className="btn-primary text-sm">Sign In</Link>
            <Link to="/register" className="btn-ghost text-sm">Register</Link>
          </div>
        </div>
      ) : (
        <div className="glass p-6 text-center"
          style={{ background: 'rgba(71,85,105,0.15)', border: '1px solid rgba(71,85,105,0.3)' }}>
          <p className="text-2xl mb-2">🏁</p>
          <p className="text-slate-400 font-semibold">This auction has ended</p>
          {auction.currentHighestBidder && (
            <p className="text-sm text-slate-500 mt-1">
              Winner: <span className="text-white font-semibold">{auction.currentHighestBidder.name}</span>
            </p>
          )}
        </div>
      )}

      {/* Bid History */}
      <div className="glass p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Bid History
          </h3>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(34,211,238,0.12)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.2)' }}>
            {bids.length} {bids.length === 1 ? 'bid' : 'bids'}
          </span>
        </div>

        {bids.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-3xl mb-2">💭</p>
            <p className="text-sm text-slate-500 italic">No bids yet. Be the first!</p>
          </div>
        ) : (
          <ul className="divide-y divide-[rgba(99,179,237,0.06)]">
            {bids.map((b, i) => <BidRow key={b._id} bid={b} rank={i + 1} />)}
          </ul>
        )}
      </div>
    </div>
  );
}
