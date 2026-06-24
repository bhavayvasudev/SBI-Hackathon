import { Router } from 'express';
import { processKYC } from '../controllers/kycController.js';

const router = Router();

router.post('/process', processKYC);

export default router;
