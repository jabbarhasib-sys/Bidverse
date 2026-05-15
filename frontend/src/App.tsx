import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Home }          from './pages/Home';
import { Login }         from './pages/Login';
import { Register }      from './pages/Register';
import { AuctionDetail } from './pages/AuctionDetail';
import { CreateAuction } from './pages/CreateAuction';
import { MyWins }        from './pages/MyWins';
import { NotFound }      from './pages/NotFound';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/"             element={<ErrorBoundary><Home /></ErrorBoundary>} />
            <Route path="/login"        element={<ErrorBoundary><Login /></ErrorBoundary>} />
            <Route path="/register"     element={<ErrorBoundary><Register /></ErrorBoundary>} />
            <Route path="/auctions/:id" element={<ErrorBoundary><AuctionDetail /></ErrorBoundary>} />
            <Route path="/create"       element={<ErrorBoundary><CreateAuction /></ErrorBoundary>} />
            <Route path="/my-wins"      element={<ErrorBoundary><MyWins /></ErrorBoundary>} />
            <Route path="*"             element={<ErrorBoundary><NotFound /></ErrorBoundary>} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
