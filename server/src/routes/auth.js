import { Router } from 'express';
import { loginCustomer, getCustomerProfile } from '../controllers/authController.js';
import { requireCustomerAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/login', loginCustomer);
router.get('/me', requireCustomerAuth, getCustomerProfile);

export default router;
