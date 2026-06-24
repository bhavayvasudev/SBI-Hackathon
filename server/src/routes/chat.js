import { Router } from 'express';
import { chat, getRecommendationsForProfile, initSession } from '../controllers/chatController.js';

const router = Router();

router.get('/session', initSession);
router.post('/message', chat);
router.post('/recommendations', getRecommendationsForProfile);

export default router;
