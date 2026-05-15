import Bid from '../database/models/Bid.model.js';
import Auction from '../database/models/Auction.model.js';

// POST /api/bids
export const placeBid = async (req, res) => {
  try {
    const { auctionId, amount } = req.body;
    if (!auctionId || !amount)
      return res.status(400).json({ message: 'auctionId and amount required' });

    const auction = await Auction.findById(auctionId);
    if (!auction)        return res.status(404).json({ message: 'Auction not found' });
    if (auction.status === 'ended' || new Date(auction.endTime) <= new Date()) 
      return res.status(400).json({ message: 'Auction not active' });
    if (amount <= auction.currentHighestBid)
      return res.status(400).json({ message: `Bid must exceed current highest bid of ${auction.currentHighestBid}` });

    // Save bid
    const bid = await Bid.create({ auction: auctionId, bidder: req.user._id, amount });

    // Update auction
    auction.currentHighestBid     = amount;
    auction.currentHighestBidder  = req.user._id;
    await auction.save();

    const payload = {
      auctionId,
      amount,
      bidder: { id: req.user._id, name: req.user.name },
      bidId: bid._id,
      timestamp: bid.createdAt,
    };

    // Broadcast to auction room
    req.io.to(auctionId).emit('new-bid', payload);

    res.status(201).json(payload);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/bids/:auctionId
export const getBids = async (req, res) => {
  try {
    const bids = await Bid.find({ auction: req.params.auctionId });
    res.json(bids);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
