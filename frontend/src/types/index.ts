export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
}

export interface Auction {
  _id: string;
  productName: string;
  description: string;
  imageUrl?: string;
  startingPrice: number;
  currentHighestBid: number;
  currentHighestBidder?: { _id: string; name: string };
  endTime: string;
  createdBy: { _id: string; name: string; email: string };
  status: 'active' | 'ended' | 'cancelled';
  winner?: string;
  createdAt: string;
}

export interface Bid {
  _id: string;
  auction: string;
  bidder: { _id: string; name: string };
  amount: number;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}
