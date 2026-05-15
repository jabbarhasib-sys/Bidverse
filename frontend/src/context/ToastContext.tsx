import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
  hiding: boolean;
}

interface ToastCtx {
  toast: (message: string, type?: ToastType) => void;
}

const Ctx = createContext<ToastCtx | null>(null);

let _id = 0;

const ICONS: Record<ToastType, string> = {
  success: '✓',
  error:   '✕',
  info:    'ℹ',
  warning: '⚠',
};

const COLORS: Record<ToastType, { border: string; icon: string; bg: string }> = {
  success: { border: 'rgba(52,211,153,0.35)', icon: '#34d399', bg: 'rgba(52,211,153,0.1)' },
  error:   { border: 'rgba(251,113,133,0.35)', icon: '#fb7185', bg: 'rgba(251,113,133,0.1)' },
  info:    { border: 'rgba(34,211,238,0.35)',  icon: '#22d3ee', bg: 'rgba(34,211,238,0.1)' },
  warning: { border: 'rgba(251,191,36,0.35)', icon: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++_id;
    setToasts((p) => [...p, { id, message, type, hiding: false }]);
    setTimeout(() => {
      setToasts((p) => p.map((t) => t.id === id ? { ...t, hiding: true } : t));
      setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 350);
    }, 3500);
  }, []);

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map((t) => {
          const c = COLORS[t.type];
          return (
            <div
              key={t.id}
              className={`toast${t.hiding ? ' hide' : ''}`}
              style={{ borderColor: c.border }}
              role="alert"
            >
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: c.bg, display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: c.icon,
                fontWeight: 800, fontSize: '1rem', flexShrink: 0
              }}>
                {ICONS[t.type]}
              </div>
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1' }}>
                {t.message}
              </span>
            </div>
          );
        })}
      </div>
    </Ctx.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useToast outside ToastProvider');
  return ctx;
};
