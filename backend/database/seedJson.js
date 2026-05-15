import { User, Auction, db } from './jsonDb.js';

const seed = async () => {
  // Clear existing
  db.saveUsers([]);
  db.saveAuctions([]);
  db.saveBids([]);

  console.log('Seeding JSON database...');

  const alice = await User.create({ name: 'Alice', email: 'alice@example.com', password: '123456' });
  const bob = await User.create({ name: 'Bob', email: 'bob@example.com', password: '123456' });

  await Auction.create({
    productName: '1967 Ford Mustang Shelby GT500',
    description: 'A fully restored classic muscle car. V8 engine, manual transmission, and iconic Eleanor styling.',
    startingPrice: 85000,
    endTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    createdBy: alice._id,
    imageUrl: 'https://images.unsplash.com/photo-1584345611124-2c027e029272?auto=format&fit=crop&q=80&w=800'
  });

  await Auction.create({
    productName: 'Rolex Submariner Date',
    description: 'A pristine condition luxury timepiece. Includes original box and papers.',
    startingPrice: 12000,
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    createdBy: bob._id,
    imageUrl: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80&w=800'
  });

  await Auction.create({
    productName: 'Vintage Leica M3 Camera',
    description: 'Legendary 35mm rangefinder camera in mint condition. Includes Summicron 50mm lens.',
    startingPrice: 3500,
    endTime: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    createdBy: alice._id,
    imageUrl: 'https://images.unsplash.com/photo-1516961642265-531546e84af2?auto=format&fit=crop&q=80&w=800'
  });

  console.log('JSON database seeded successfully! Users: users.json, Auctions: auctions.json');
};

seed();
