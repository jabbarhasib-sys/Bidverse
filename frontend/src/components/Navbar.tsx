import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { io } from 'socket.io-client';

const API = import.meta.env.VITE_API_URL;

export function Navbar() {
  const { user, token, logout } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Global socket listener for won auctions
  useEffect(() => {
    if (!user || !token) return;
    const socket = io(API, { auth: { token } });
    socket.emit('join-user', user._id);
    
    socket.on('auction-won', (data) => {
      toast(`🎉 Congratulations! You won the auction for ${data.productName}`, 'success');
    });

    return () => { socket.disconnect(); };
  }, [user, token, toast]);

  // Close menu on route change
  useEffect(() => setMenuOpen(false), [location]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[rgba(7,11,20,0.95)] border-b border-[rgba(34,211,238,0.1)] shadow-2xl'
          : 'bg-transparent border-b border-transparent'
      }`}
      style={{ backdropFilter: scrolled ? 'blur(24px)' : 'none' }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group" aria-label="BidVerse Home">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:shadow-cyan-500/50 transition-shadow">
            <span className="text-white font-black text-lg leading-none">⚡</span>
          </div>
          <span
            className="text-2xl font-black tracking-tight grad-text"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            BidVerse
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[rgba(34,211,238,0.06)] border border-[rgba(34,211,238,0.12)]">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white text-xs font-black">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-slate-300">
                  {user.name}
                </span>
              </div>
              <Link to="/my-wins" className="btn-ghost text-sm px-3">
                🏆 My Wins
              </Link>
              <Link to="/create" className="btn-primary text-sm">
                <span>＋</span> Create Auction
              </Link>
              <button
                onClick={logout}
                className="btn-ghost text-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost text-sm">
                Login
              </Link>
              <Link to="/register" className="btn-primary text-sm">
                Get Started →
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden btn-ghost p-2"
          onClick={() => setMenuOpen((p) => !p)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <div className="flex flex-col gap-1.5 w-5">
            <span className={`block h-0.5 bg-slate-300 transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block h-0.5 bg-slate-300 transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 bg-slate-300 transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </div>
        </button>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden glass mx-4 mb-4 p-4 flex flex-col gap-3 page-enter">
          {user ? (
            <>
              <div className="flex items-center gap-3 pb-3 border-b border-[rgba(99,179,237,0.12)]">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-black">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{user.name}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </div>
              </div>
              <Link to="/my-wins" className="btn-ghost w-full justify-center">
                🏆 My Wins
              </Link>
              <Link to="/create" className="btn-primary w-full justify-center">
                ＋ Create Auction
              </Link>
              <button onClick={logout} className="btn-ghost w-full justify-center">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost w-full justify-center">Login</Link>
              <Link to="/register" className="btn-primary w-full justify-center">Get Started →</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
