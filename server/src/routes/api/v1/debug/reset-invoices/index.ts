import { Router } from 'express';
import { resetInvoices } from '../../../../../controllers/debugController';

const router = Router();

router.post('/', resetInvoices);

export default router;
