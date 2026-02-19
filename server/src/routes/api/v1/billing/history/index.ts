import { Router } from 'express';
import { getBillingHistory } from '../../../../../controllers/billingController';

const router = Router();

router.get('/', getBillingHistory);

export default router;
