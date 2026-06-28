import { Router } from 'express';
import { chat, getRecommendationsForProfile, initSession } from '../controllers/chatController.js';
import { validate, recommendationSchema } from '../middleware/validate.js';

const router = Router();

router.get('/session', initSession);
router.post('/message', chat);
router.post('/recommendations', validate(recommendationSchema), getRecommendationsForProfile);

export default router;
