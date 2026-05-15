import Auction from '../database/models/Auction.model.js';

// GET /api/auctions
export const getAuctions = async (_req, res) => {
  try {
    const auctions = await Auction.find();
    res.json(auctions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/auctions/:id
export const getAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) return res.status(404).json({ message: 'Auction not found' });
    res.json(auction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auctions
export const createAuction = async (req, res) => {
  try {
    const { productName, description, startingPrice, endTime, imageUrl } = req.body;
    if (!productName || !description || !startingPrice || !endTime)
      return res.status(400).json({ message: 'All fields required' });

    const auction = await Auction.create({
      productName,
      description,
      startingPrice,
      endTime,
      imageUrl,
      createdBy: req.user._id,
    });
    res.status(201).json(auction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/auctions/:id/end  (manual end or cron)
export const endAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) return res.status(404).json({ message: 'Not found' });
    if (auction.createdBy._id !== req.user._id && auction.createdBy !== req.user._id)
      return res.status(403).json({ message: 'Forbidden' });

    auction.status = 'ended';
    auction.winner = auction.currentHighestBidder;
    await auction.save();

    req.io.to(req.params.id).emit('auction-ended', {
      auctionId: auction._id,
      winner: auction.winner,
      finalBid: auction.currentHighestBid,
    });

    if (auction.winner) {
      const winnerId = auction.winner._id || auction.winner;
      req.io.to(winnerId).emit('auction-won', {
        auctionId: auction._id,
        productName: auction.productName,
        finalBid: auction.currentHighestBid,
      });
    }

    res.json(auction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/auctions/won
export const getWonAuctions = async (req, res) => {
  try {
    const auctions = await Auction.find();
    const wonAuctions = auctions.filter(
      (a) => a.status === 'ended' && 
             (a.winner?._id === req.user._id || a.winner === req.user._id || 
              a.currentHighestBidder?._id === req.user._id || a.currentHighestBidder === req.user._id)
    );
    res.json(wonAuctions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
