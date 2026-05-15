import { Router } from 'express';
import { getAuctions, getAuction, createAuction, endAuction, getWonAuctions } from '../controllers/auctionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/',          getAuctions);
router.get('/won',       protect, getWonAuctions);
router.get('/:id',       getAuction);
router.post('/',         protect, createAuction);
router.patch('/:id/end', protect, endAuction);

export default router;
