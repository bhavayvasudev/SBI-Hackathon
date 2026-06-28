import { Router } from 'express';
import { getDashboardStats, getCustomers, updateKycStatus } from '../controllers/analyticsController.js';
import { requireAdminAuth } from '../middleware/authMiddleware.js';
import { validate, kycActionSchema } from '../middleware/validate.js';

const router = Router();

router.use(requireAdminAuth);

router.get('/dashboard', getDashboardStats);
router.get('/customers', getCustomers);
router.put('/customers/:id/kyc', validate(kycActionSchema), updateKycStatus);

export default router;
