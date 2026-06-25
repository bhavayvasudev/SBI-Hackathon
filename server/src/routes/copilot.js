import { Router } from 'express';
import { chatWithCopilot } from '../controllers/copilotController.js';
import { requireCustomerAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/chat', requireCustomerAuth, chatWithCopilot);

export default router;
