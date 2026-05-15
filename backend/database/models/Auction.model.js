import mongoose from 'mongoose';

const auctionSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    startingPrice: { type: Number, required: true, min: 0 },
    currentHighestBid: { type: Number, default: 0 },
    currentHighestBidder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    endTime: { type: Date, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['active', 'ended', 'cancelled'], default: 'active' },
    winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

// Virtual: is auction live?
auctionSchema.virtual('isLive').get(function () {
  return this.status === 'active' && new Date() < this.endTime;
});

export default mongoose.model('Auction', auctionSchema);
