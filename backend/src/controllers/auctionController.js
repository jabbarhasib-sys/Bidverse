import Auction from '../../database/models/Auction.model.js';

const POPULATE_CREATED = { path: 'createdBy', select: 'name email' };
const POPULATE_BIDDER  = { path: 'currentHighestBidder', select: 'name' };

// GET /api/auctions
export const getAuctions = async (_req, res) => {
  try {
    const auctions = await Auction.find()
      .populate(POPULATE_CREATED)
      .populate(POPULATE_BIDDER)
      .sort({ createdAt: -1 });
    res.json(auctions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/auctions/won  (must be BEFORE /:id route)
export const getWonAuctions = async (req, res) => {
  try {
    const uid = String(req.user._id);
    const auctions = await Auction.find({ status: 'ended' })
      .populate(POPULATE_CREATED)
      .populate(POPULATE_BIDDER);
    const wonAuctions = auctions.filter((a) => {
      const winnerId = a.winner ? String(a.winner._id || a.winner) : null;
      const bidderId = a.currentHighestBidder ? String(a.currentHighestBidder._id || a.currentHighestBidder) : null;
      return winnerId === uid || bidderId === uid;
    });
    res.json(wonAuctions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/auctions/:id
export const getAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate(POPULATE_CREATED)
      .populate(POPULATE_BIDDER);
    if (!auction) return res.status(404).json({ message: 'Auction not found' });
    res.json(auction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auctions
export const createAuction = async (req, res) => {
  try {
    const { productName, description, startingPrice, endTime, imageUrl, category } = req.body;
    if (!productName || !description || !startingPrice || !endTime)
      return res.status(400).json({ message: 'All fields required' });

    const auction = await Auction.create({
      productName, description, startingPrice, endTime, imageUrl, category,
      currentHighestBid: parseFloat(startingPrice),
      createdBy: req.user._id,
    });
    const populated = await auction.populate(POPULATE_CREATED);
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/auctions/:id/end  (manual end)
export const endAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id).populate(POPULATE_BIDDER);
    if (!auction) return res.status(404).json({ message: 'Not found' });

    const creatorId = String(auction.createdBy._id || auction.createdBy);
    const userId    = String(req.user._id);
    if (creatorId !== userId)
      return res.status(403).json({ message: 'Forbidden' });

    auction.status = 'ended';
    auction.winner = auction.currentHighestBidder?._id || auction.currentHighestBidder;
    await auction.save();

    const result = await Auction.findById(auction._id)
      .populate(POPULATE_CREATED)
      .populate(POPULATE_BIDDER);

    req.io.to(String(auction._id)).emit('auction-ended', {
      auctionId: auction._id,
      winner: auction.winner,
      finalBid: auction.currentHighestBid,
    });

    if (auction.winner) {
      const winnerId = String(auction.winner._id || auction.winner);
      req.io.to(winnerId).emit('auction-won', {
        auctionId: auction._id,
        productName: auction.productName,
        finalBid: auction.currentHighestBid,
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
