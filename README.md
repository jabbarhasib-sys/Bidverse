# BidVerse – Real-Time Auction Platform

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
cd database
node seeds/seed.js
```

## Deploy
- Frontend → Vercel
- Backend → Render
- Database → MongoDB Atlas
