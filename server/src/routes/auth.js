import { Router } from 'express';
import {
  loginCustomer,
  logoutCustomer,
  getCustomerProfile,
  loginAdmin,
  logoutAdmin,
} from '../controllers/authController.js';
import { requireCustomerAuth, requireAdminAuth } from '../middleware/authMiddleware.js';
import { validate, loginSchema, adminLoginSchema } from '../middleware/validate.js';

const router = Router();

router.post('/login',       validate(loginSchema),      loginCustomer);
router.post('/logout',      requireCustomerAuth,         logoutCustomer);
router.get('/me',           requireCustomerAuth,         getCustomerProfile);

router.post('/admin-login',  validate(adminLoginSchema), loginAdmin);
router.post('/admin-logout', requireAdminAuth,           logoutAdmin);

export default router;
