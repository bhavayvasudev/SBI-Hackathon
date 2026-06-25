import { Router } from 'express';
import { getDashboardStats, getCustomers, updateKycStatus } from '../controllers/analyticsController.js';

const router = Router();

router.get('/dashboard', getDashboardStats);
router.get('/customers', getCustomers);
router.put('/customers/:id/kyc', updateKycStatus);

export default router;
