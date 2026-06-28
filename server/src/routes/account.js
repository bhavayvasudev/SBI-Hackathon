import { Router } from 'express';
import { createAccount } from '../controllers/accountController.js';
import { validate, createAccountSchema } from '../middleware/validate.js';

const router = Router();

router.post('/create', validate(createAccountSchema), createAccount);

export default router;
