interface Props {
  active: string;
  onChange: (v: string) => void;
}

const FILTERS = [
  { key: 'all',    label: 'All',     icon: '🌐' },
  { key: 'active', label: 'Live',    icon: '⚡' },
  { key: 'ended',  label: 'Ended',   icon: '🏁' },
];

export function TagFilter({ active, onChange }: Props) {
  return (
    <div className="flex gap-2 flex-shrink-0" role="group" aria-label="Filter by status">
      {FILTERS.map(({ key, label, icon }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          aria-pressed={active === key}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 ${
            active === key
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-transparent shadow-lg shadow-cyan-500/30 scale-[1.02]'
              : 'text-slate-400 border-[rgba(99,179,237,0.15)] hover:text-white hover:border-[rgba(34,211,238,0.3)] bg-[rgba(7,11,20,0.5)]'
          }`}
        >
          <span>{icon}</span>
          {label}
        </button>
      ))}
    </div>
  );
}
