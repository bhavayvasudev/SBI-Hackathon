import { Router } from 'express';
import { loginCustomer, getCustomerProfile, loginAdmin } from '../controllers/authController.js';
import { requireCustomerAuth } from '../middleware/authMiddleware.js';
import { validate, loginSchema, adminLoginSchema } from '../middleware/validate.js';

const router = Router();

router.post('/login', validate(loginSchema), loginCustomer);
router.post('/admin-login', validate(adminLoginSchema), loginAdmin);
router.get('/me', requireCustomerAuth, getCustomerProfile);

export default router;
