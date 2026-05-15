# BidVerse – Real-Time Auction Platform

BidVerse: A real-time bidding platform featuring live auction updates via WebSockets and user authentication.

## Structure
```
bidverse/
├── frontend/   React + TypeScript + Tailwind
├── backend/    Node.js + Express + Socket.IO
├── database/   Mongoose models
```

## Quick Start

### Backend
```bash
cd backend
cp ../.env.example .env   # fill in values
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Seed DB
```bash
cd backend/database
node seeds/seed.js
```

## Deploy
- Frontend → Vercel
- Backend → Render
- Database → MongoDB Atlas
