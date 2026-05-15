import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../db.js';
import User from '../models/User.model.js';
import Auction from '../models/Auction.model.js';

await connectDB();

// Clear existing
await User.deleteMany();
await Auction.deleteMany();

// Seed users
const [alice, bob] = await User.create([
  { name: 'Alice', email: 'alice@example.com', password: '123456' },
  { name: 'Bob',   email: 'bob@example.com',   password: '123456' },
]);

// Seed auctions
await Auction.create([
  {
    productName: '1967 Ford Mustang Shelby GT500',
    description: 'A fully restored classic muscle car. V8 engine, manual transmission, and iconic Eleanor styling.',
    startingPrice: 85000,
    currentHighestBid: 85000,
    endTime: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48h from now
    createdBy: alice._id,
    imageUrl: 'https://images.unsplash.com/photo-1584345611124-2c027e029272?auto=format&fit=crop&q=80&w=800'
  },
  {
    productName: 'Rolex Submariner Date',
    description: 'A pristine condition luxury timepiece. Includes original box and papers.',
    startingPrice: 12000,
    currentHighestBid: 12000,
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h from now
    createdBy: bob._id,
    imageUrl: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80&w=800'
  },
  {
    productName: 'Vintage Leica M3 Camera',
    description: 'Legendary 35mm rangefinder camera in mint condition. Includes Summicron 50mm lens.',
    startingPrice: 3500,
    currentHighestBid: 3500,
    endTime: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12h from now
    createdBy: alice._id,
    imageUrl: 'https://images.unsplash.com/photo-1516961642265-531546e84af2?auto=format&fit=crop&q=80&w=800'
  },
  {
    productName: 'Original First Edition Charizard Holographic Card',
    description: 'PSA 10 Gem Mint condition. The holy grail of trading card collections.',
    startingPrice: 150000,
    currentHighestBid: 150000,
    endTime: new Date(Date.now() + 72 * 60 * 60 * 1000), // 72h from now
    createdBy: bob._id,
    imageUrl: 'https://images.unsplash.com/photo-1613771404721-1f92d799e49f?auto=format&fit=crop&q=80&w=800'
  }
]);

console.log('Seed complete: 2 users, 4 premium auctions');
await mongoose.disconnect();
