import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

import authRoutes    from './routes/auth.routes.js';
import auctionRoutes from './routes/auction.routes.js';
import bidRoutes     from './routes/bid.routes.js';
import { connectDB } from '../database/db.js';

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) callback(null, true);
      else callback(null, false);
    },
    methods: ['GET', 'POST'],
  },
});

// ── Middleware ────────────────────────────────────────────
// Allow any localhost port in dev (handles Vite port-bumping 5173→5174→etc.)
const corsOptions = {
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.use(express.json());

// Attach io to every request so controllers can emit
app.use((req, _res, next) => { req.io = io; next(); });

// ── Routes ───────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/bids',     bidRoutes);

app.get('/', (_req, res) => res.json({ status: 'BidVerse API running' }));

// ── Socket.IO ─────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-auction', (auctionId) => {
    socket.join(auctionId);
    console.log(`${socket.id} joined room ${auctionId}`);
  });

  socket.on('join-user', (userId) => {
    socket.join(userId);
    console.log(`${socket.id} joined personal room ${userId}`);
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
  await connectDB();
  
  server.listen(PORT, () => {
    console.log(`\n🚀 BidVerse API running on http://localhost:${PORT}`);
    console.log(`   MongoDB Connected | CORS: ${process.env.CLIENT_URL || 'any localhost'}\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️  Port ${PORT} is in use — trying port ${PORT + 1}…`);
      server.close();
      // Note: in production Render usually handles the port, so this is mostly for local dev
      process.env.PORT = (PORT + 1).toString();
      start(); 
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });
}

start();
