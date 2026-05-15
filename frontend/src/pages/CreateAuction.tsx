import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL;

interface FormState {
  productName: string;
  description: string;
  startingPrice: string;
  endTime: string;
  imageUrl: string;
}

const CATEGORIES = ['Electronics', 'Art', 'Collectibles', 'Fashion', 'Jewelry', 'Vehicles', 'Other'];

export function CreateAuction() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({
    productName: '', description: '', startingPrice: '', endTime: '', imageUrl: '',
  });
  const [category, setCategory] = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [imgPreview, setImgPreview] = useState('');

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((p) => ({ ...p, [k]: e.target.value }));
    if (k === 'imageUrl') setImgPreview(e.target.value);
  };

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/api/auctions`, {
        ...form,
        startingPrice: parseFloat(form.startingPrice),
        category,
      });
      navigate(`/auctions/${data._id}`);
    } catch (err: unknown) {
      const e2 = err as { response?: { data?: { message?: string } } };
      setError(e2.response?.data?.message ?? 'Failed to create auction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Minimum end time: 30 minutes from now
  const minEndTime = new Date(Date.now() + 30 * 60_000).toISOString().slice(0, 16);

  return (
    <div className="min-h-screen relative">
      <div className="mesh-bg" />
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 py-10 page-enter">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors mb-8 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          Back to Auctions
        </Link>

        <div className="mb-8">
          <h1 className="hero-title text-4xl font-extrabold text-white mb-2">
            Create <span className="grad-text">Auction</span>
          </h1>
          <p className="text-slate-400">List your item and let the bidding begin.</p>
        </div>

        <div className="grid md:grid-cols-5 gap-6">
          {/* Form */}
          <form
            onSubmit={handle}
            className="md:col-span-3 glass p-7 space-y-6"
            id="create-auction-form"
          >
            {/* Product Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Product Name <span className="text-rose-400">*</span>
              </label>
              <input
                required
                value={form.productName}
                onChange={set('productName')}
                placeholder="e.g. Vintage Rolex Submariner"
                className="input-field"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Category</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c === category ? '' : c)}
                    className={`chip cursor-pointer transition-all ${c === category ? 'active' : ''}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Description <span className="text-rose-400">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={set('description')}
                placeholder="Describe your item in detail: condition, history, unique features..."
                className="input-field resize-none"
                style={{ paddingTop: '0.85rem' }}
              />
              <p className="text-xs text-slate-500 mt-1 text-right">{form.description.length} chars</p>
            </div>

            {/* Price & End Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Starting Price (₹) <span className="text-rose-400">*</span>
                </label>
                <div className="bid-input-wrap">
                  <span className="currency-sym">₹</span>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.01"
                    value={form.startingPrice}
                    onChange={set('startingPrice')}
                    placeholder="0.00"
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  End Time <span className="text-rose-400">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  min={minEndTime}
                  value={form.endTime}
                  onChange={set('endTime')}
                  className="input-field"
                />
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Image URL <span className="text-slate-500">(optional)</span>
              </label>
              <input
                value={form.imageUrl}
                onChange={set('imageUrl')}
                placeholder="https://..."
                className="input-field"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.3)' }}>
                <span className="text-rose-400">⚠</span>
                <p className="text-sm text-rose-300">{error}</p>
              </div>
            )}

            <button
              type="submit"
              id="create-auction-btn"
              disabled={loading}
              className="btn-primary w-full text-base py-4"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Auction…
                </span>
              ) : '🚀 Launch Auction'}
            </button>
          </form>

          {/* Preview sidebar */}
          <div className="md:col-span-2 space-y-5">
            {/* Image preview */}
            <div className="glass overflow-hidden" style={{ minHeight: 180 }}>
              {imgPreview ? (
                <img
                  src={imgPreview}
                  alt="Preview"
                  className="w-full h-44 object-cover"
                  onError={() => setImgPreview('')}
                />
              ) : (
                <div className="h-44 flex flex-col items-center justify-center gap-2" style={{
                  background: 'linear-gradient(135deg, rgba(34,211,238,0.05), rgba(139,92,246,0.05))'
                }}>
                  <span style={{ fontSize: '2.5rem' }}>🖼️</span>
                  <p className="text-xs text-slate-500">Image preview</p>
                </div>
              )}
              <div className="p-4">
                <p className="font-bold text-white text-sm line-clamp-1">
                  {form.productName || 'Product Name'}
                </p>
                {form.startingPrice && (
                  <p className="grad-text font-black text-lg mt-1">₹{parseFloat(form.startingPrice || '0').toLocaleString()}</p>
                )}
              </div>
            </div>

            {/* Tips */}
            <div className="glass p-5">
              <p className="text-sm font-bold text-white mb-3">💡 Auction Tips</p>
              <ul className="space-y-2">
                {[
                  'Use a high-quality image for more bids',
                  'Set a fair starting price to attract bidders',
                  'Detailed descriptions build buyer trust',
                  'Longer auction times = more competition',
                ].map((tip) => (
                  <li key={tip} className="flex items-start gap-2 text-xs text-slate-400">
                    <span className="text-cyan-400 mt-0.5 flex-shrink-0">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
