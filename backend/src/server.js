import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

import authRoutes    from './routes/auth.routes.js';
import auctionRoutes from './routes/auction.routes.js';
import bidRoutes     from './routes/bid.routes.js';
import { connectDB } from '../database/db.js';

// Ensure JWT_SECRET always has a value
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'bidverse-fallback-secret-change-in-prod';
  console.warn('⚠️  JWT_SECRET not set — using fallback. Set it in Render environment!');
}

const app    = express();
const server = http.createServer(app);

// ── Socket.IO (allow all origins for deployment) ──────────
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

// ── Middleware ────────────────────────────────────────────
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Attach io to every request so controllers can emit
app.use((req, _res, next) => { req.io = io; next(); });

// ── Routes ───────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/bids',     bidRoutes);

app.get('/', (_req, res) => res.json({ status: 'BidVerse API v1.1 running ✅' }));

// ── Socket.IO ─────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-auction', (auctionId) => {
    socket.join(auctionId);
  });

  socket.on('join-user', (userId) => {
    socket.join(userId);
  });

  socket.on('leave-auction', (auctionId) => {
    socket.leave(auctionId);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// ── Start ─────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '5001', 10);

async function start() {
  try {
    await connectDB();
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`\n🚀 BidVerse API v1.1 running on port ${PORT}`);
      console.log(`   CORS: all origins | JWT: ${process.env.JWT_SECRET ? 'set' : 'MISSING'}\n`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

start();
