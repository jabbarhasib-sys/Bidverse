import { Auction } from '../types';
import { NoteCard } from './NoteCard';

interface Props { auctions: Auction[]; }

export function NoteList({ auctions }: Props) {
  if (!auctions.length) {
    return (
      <div className="text-center py-24 page-enter">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6"
          style={{
            background: 'rgba(34,211,238,0.06)',
            border: '1px solid rgba(34,211,238,0.12)',
          }}
        >
          <span style={{ fontSize: '2.5rem' }}>🏷️</span>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No auctions found</h3>
        <p className="text-slate-400 text-sm max-w-xs mx-auto">
          Try adjusting your search or filters to discover more items.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {auctions.map((a, i) => (
        <NoteCard key={a._id} auction={a} index={i} />
      ))}
    </div>
  );
}
