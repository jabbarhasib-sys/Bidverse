import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Import models for auto-seeding
import User from './models/User.model.js';
import Auction from './models/Auction.model.js';

export const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;
    let isInMemory = false;
    
    // If the URI is a placeholder or localhost but Mongo isn't running, we'll use an in-memory DB
    if (!uri || uri.includes('<user>') || uri.includes('127.0.0.1')) {
      console.log('Using in-memory MongoDB for local testing...');
      const mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
      isInMemory = true;
    }

    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}`);

    // Always ensure demo accounts exist (it will skip if already present)
    await autoSeed();
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

async function autoSeed() {
  const userCount = await User.countDocuments();
  if (userCount > 0) return; // already seeded

  console.log('Seeding in-memory database...');
  const [alice, bob, jabbar] = await User.create([
    { name: 'Alice',  email: 'alice@example.com',     password: '123456' },
    { name: 'Bob',    email: 'bob@example.com',       password: '123456' },
    { name: 'Jabbar', email: 'jabbar.hasib@gmail.com', password: '123456' },
  ]);

  await Auction.create([
    {
      productName: '1967 Ford Mustang Shelby GT500',
      description: 'A fully restored classic muscle car. V8 engine, manual transmission, and iconic Eleanor styling.',
      startingPrice: 85000,
      currentHighestBid: 85000,
      endTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
      createdBy: alice._id,
      imageUrl: 'https://images.unsplash.com/photo-1584345611124-2c027e029272?auto=format&fit=crop&q=80&w=800'
    },
    {
      productName: 'Rolex Submariner Date',
      description: 'A pristine condition luxury timepiece. Includes original box and papers.',
      startingPrice: 12000,
      currentHighestBid: 12000,
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      createdBy: bob._id,
      imageUrl: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80&w=800'
    },
    {
      productName: 'Vintage Leica M3 Camera',
      description: 'Legendary 35mm rangefinder camera in mint condition. Includes Summicron 50mm lens.',
      startingPrice: 3500,
      currentHighestBid: 3500,
      endTime: new Date(Date.now() + 12 * 60 * 60 * 1000),
      createdBy: alice._id,
      imageUrl: 'https://images.unsplash.com/photo-1516961642265-531546e84af2?auto=format&fit=crop&q=80&w=800'
    },
    {
      productName: 'Original First Edition Charizard Holographic Card',
      description: 'PSA 10 Gem Mint condition. The holy grail of trading card collections.',
      startingPrice: 150000,
      currentHighestBid: 150000,
      endTime: new Date(Date.now() + 72 * 60 * 60 * 1000),
      createdBy: bob._id,
      imageUrl: 'https://images.unsplash.com/photo-1613771404721-1f92d799e49f?auto=format&fit=crop&q=80&w=800'
    }
  ]);
  console.log('In-memory database seeded successfully!');
}
