interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Search auctions...' }: Props) {
  return (
    <div className="relative group flex-1">
      <svg
        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-cyan-400 transition-colors duration-200 pointer-events-none"
        fill="none" stroke="currentColor" strokeWidth={2}
        viewBox="0 0 24 24" aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search auctions"
        className="input-field pl-12 pr-10"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-600 transition-all"
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
}
