import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
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
            <Route path="/"             element={<Home />} />
            <Route path="/login"        element={<Login />} />
            <Route path="/register"     element={<Register />} />
            <Route path="/auctions/:id" element={<AuctionDetail />} />
            <Route path="/create"       element={<CreateAuction />} />
            <Route path="/my-wins"      element={<MyWins />} />
            <Route path="*"             element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
