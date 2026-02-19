import { Router } from 'express';
import { getDashboardStats } from '../../../../controllers/invoiceController';

const router = Router();

router.get('/', getDashboardStats);

export default router;
