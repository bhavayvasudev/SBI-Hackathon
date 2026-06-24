import { Router } from 'express';
import { createAccount } from '../controllers/accountController.js';

const router = Router();

router.post('/create', createAccount);

export default router;
