import { Router } from 'express';
import { getDashboardStats } from '../controllers/analyticsController.js';

const router = Router();

router.get('/dashboard', getDashboardStats);

export default router;
