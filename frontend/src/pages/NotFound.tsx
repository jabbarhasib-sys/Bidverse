import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center text-center px-4">
      <div className="mesh-bg" />

      <div className="orb w-72 h-72 top-1/4 left-1/4 opacity-15"
        style={{ background: 'radial-gradient(circle, #22d3ee, transparent 70%)' }} />

      <div className="relative z-10 page-enter">
        <div className="text-8xl mb-6 select-none" style={{ filter: 'drop-shadow(0 0 30px rgba(34,211,238,0.3))' }}>
          404
        </div>
        <h1 className="hero-title text-3xl font-extrabold text-white mb-3">
          Page <span className="grad-text">Not Found</span>
        </h1>
        <p className="text-slate-400 mb-8 max-w-sm">
          Looks like this auction lot has gone missing. Let's get you back to the action.
        </p>
        <Link to="/" className="btn-primary text-base px-8 py-4">
          Back to Home →
        </Link>
      </div>
    </div>
  );
}
