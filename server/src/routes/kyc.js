import { Router } from 'express';
import { processKYC } from '../controllers/kycController.js';
import { validate, kycProcessSchema } from '../middleware/validate.js';

const router = Router();

router.post('/process', validate(kycProcessSchema), processKYC);

export default router;
