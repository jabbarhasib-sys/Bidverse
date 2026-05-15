import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const read = (file) => {
  const p = path.join(DATA_DIR, file);
  if (!fs.existsSync(p)) fs.writeFileSync(p, '[]');
  return JSON.parse(fs.readFileSync(p, 'utf8'));
};

const write = (file, data) => fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2));

const genId = () => crypto.randomBytes(12).toString('hex');

export const db = {
  getUsers: () => read('users.json'),
  getAuctions: () => read('auctions.json'),
  getBids: () => read('bids.json'),
  saveUsers: (d) => write('users.json', d),
  saveAuctions: (d) => write('auctions.json', d),
  saveBids: (d) => write('bids.json', d),
};

export const User = {
  findOne: async (query) => db.getUsers().find(u => Object.keys(query).every(k => u[k] === query[k])),
  findById: async (id) => db.getUsers().find(u => u._id === id),
  create: async (data) => {
    const users = db.getUsers();
    const user = { _id: genId(), ...data, createdAt: new Date().toISOString() };
    if (data.password) user.password = await bcrypt.hash(data.password, 10);
    users.push(user);
    db.saveUsers(users);
    return user;
  },
  matchPassword: async (user, plain) => bcrypt.compare(plain, user.password)
};

export const Auction = {
  find: async () => {
    const users = db.getUsers();
    const now = new Date();
    return db.getAuctions().map(a => {
      const endTime = new Date(a.endTime);
      const computedStatus = endTime > now ? 'active' : 'ended';
      
      return {
        ...a,
        status: a.status || computedStatus, // Use stored status or fallback to computed
        createdBy: users.find(u => u._id === a.createdBy) || a.createdBy,
        currentHighestBidder: users.find(u => u._id === a.currentHighestBidder) || a.currentHighestBidder
      };
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
  findById: async (id) => {
    const users = db.getUsers();
    const a = db.getAuctions().find(a => a._id === id);
    if (!a) return null;
    const now = new Date();
    const endTime = new Date(a.endTime);
    const computedStatus = endTime > now ? 'active' : 'ended';
    
    return {
      ...a,
      status: a.status || computedStatus,
      createdBy: users.find(u => u._id === a.createdBy) || a.createdBy,
      currentHighestBidder: users.find(u => u._id === a.currentHighestBidder) || a.currentHighestBidder
    };
  },
  create: async (data) => {
    const auctions = db.getAuctions();
    const auction = { 
      _id: genId(), 
      ...data, 
      status: 'active', // Explicitly set active on create
      currentHighestBid: data.startingPrice, 
      createdAt: new Date().toISOString() 
    };
    auctions.push(auction);
    db.saveAuctions(auctions);
    return auction;
  },
  save: async (auctionObj) => {
    const auctions = db.getAuctions();
    const idx = auctions.findIndex(a => a._id === auctionObj._id);
    if (idx !== -1) {
      // Un-populate for saving
      const toSave = { ...auctionObj };
      if (toSave.createdBy && toSave.createdBy._id) toSave.createdBy = toSave.createdBy._id;
      if (toSave.currentHighestBidder && toSave.currentHighestBidder._id) toSave.currentHighestBidder = toSave.currentHighestBidder._id;
      auctions[idx] = toSave;
      db.saveAuctions(auctions);
    }
  }
};

export const Bid = {
  find: async (query) => {
    const users = db.getUsers();
    return db.getBids()
      .filter(b => Object.keys(query).every(k => b[k] === query[k]))
      .map(b => ({ ...b, bidder: users.find(u => u._id === b.bidder) || b.bidder }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
  create: async (data) => {
    const bids = db.getBids();
    const bid = { _id: genId(), ...data, createdAt: new Date().toISOString() };
    bids.push(bid);
    db.saveBids(bids);
    return bid;
  }
};
