import { Router } from 'express';
import { generateTodayInvoices } from '../../../../../controllers/billingController';

const router = Router();

router.post('/', generateTodayInvoices);

export default router;
