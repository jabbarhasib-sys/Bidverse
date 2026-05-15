import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Auction } from '../types';

interface Props { auction: Auction; index?: number; }

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

function Countdown({ endTime }: { endTime: string }) {
  const { d, h, m, s, total } = useLiveCountdown(endTime);
  const urgent = total > 0 && total < 3_600_000; // < 1 hour

  if (total === 0) return (
    <span className="badge-ended" style={{ fontSize: '0.65rem' }}>Ended</span>
  );

  return (
    <div className="flex items-center gap-1">
      {d > 0 && (
        <div className="countdown-digit" style={{ minWidth: 40, borderColor: 'rgba(34,211,238,0.2)' }}>
          <span className="digit-val">{String(d).padStart(2,'0')}</span>
          <span className="digit-label">d</span>
        </div>
      )}
      <div className="countdown-digit" style={{ borderColor: urgent ? 'rgba(251,113,133,0.4)' : 'rgba(34,211,238,0.2)' }}>
        <span className="digit-val" style={{ color: urgent ? '#fb7185' : undefined }}>
          {String(h).padStart(2,'0')}
        </span>
        <span className="digit-label">h</span>
      </div>
      <span className="text-slate-500 font-bold pb-1">:</span>
      <div className="countdown-digit" style={{ borderColor: urgent ? 'rgba(251,113,133,0.4)' : 'rgba(34,211,238,0.2)' }}>
        <span className="digit-val" style={{ color: urgent ? '#fb7185' : undefined }}>
          {String(m).padStart(2,'0')}
        </span>
        <span className="digit-label">m</span>
      </div>
      <span className="text-slate-500 font-bold pb-1">:</span>
      <div className="countdown-digit" style={{ borderColor: urgent ? 'rgba(251,113,133,0.4)' : 'rgba(34,211,238,0.2)' }}>
        <span className="digit-val" style={{ color: urgent ? '#fb7185' : undefined }}>
          {String(s).padStart(2,'0')}
        </span>
        <span className="digit-label">s</span>
      </div>
    </div>
  );
}

export function NoteCard({ auction, index = 0 }: Props) {
  // Use endTime comparison as the source of truth for "live" state in the UI
  const isExpired = new Date(auction.endTime) <= new Date();
  const live = auction.status === 'active' && !isExpired;
  const [imgError, setImgError] = useState(false);

  return (
    <Link
      to={`/auctions/${auction._id}`}
      className="glass glass-hover flex flex-col overflow-hidden group page-enter"
      style={{
        animationDelay: `${index * 60}ms`,
        animationFillMode: 'both',
      }}
      aria-label={`View ${auction.productName}`}
    >
      {/* Image area */}
      <div className="relative overflow-hidden" style={{ height: 200 }}>
        {auction.imageUrl && !imgError ? (
          <>
            <img
              src={auction.imageUrl}
              alt={auction.productName}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              onError={() => setImgError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070b14] via-transparent to-transparent opacity-60" />
          </>
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, hsl(${(index * 47) % 360}, 40%, 12%), hsl(${(index * 47 + 120) % 360}, 40%, 8%))`
            }}
          >
            <span style={{ fontSize: '3rem', opacity: 0.4 }}>🏷️</span>
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          {live ? <span className="badge-live">Live</span> : <span className="badge-ended">Ended</span>}
        </div>

        {/* Price overlay */}
        <div className="absolute bottom-3 right-3">
          <div className="glass px-3 py-1.5" style={{ borderRadius: 10 }}>
            <span className="text-xs text-slate-400 block leading-none mb-0.5">Highest Bid</span>
            <span className="text-sm font-black grad-text">₹{auction.currentHighestBid.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-white text-base leading-tight group-hover:text-cyan-400 transition-colors mb-2 line-clamp-1">
          {auction.productName}
        </h3>
        <p className="text-sm text-slate-400 leading-relaxed line-clamp-2 mb-4 flex-1">
          {auction.description}
        </p>

        {/* Footer */}
        <div className="pt-4 border-t border-[rgba(99,179,237,0.08)]">
          {live ? (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                ⏱ Ends in
              </p>
              <Countdown endTime={auction.endTime} />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {auction.currentHighestBidder ? (
                <>
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                    {auction.currentHighestBidder?.name?.charAt(0)?.toUpperCase() ?? '?'}
                  </div>
                  <p className="text-xs text-slate-500">
                    Won by <span className="text-slate-300 font-semibold">{auction.currentHighestBidder?.name ?? 'Unknown'}</span>
                  </p>
                </>
              ) : (
                <p className="text-xs text-slate-500">No bids placed</p>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
