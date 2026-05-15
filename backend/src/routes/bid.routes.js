import { Router } from 'express';
import { placeBid, getBids } from '../controllers/bidController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/',              protect, placeBid);
router.get('/:auctionId',    getBids);

export default router;
