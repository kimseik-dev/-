import { Router } from 'express';
import { updateCustomer } from '../../../../../controllers/customerController';

const router = Router();

router.put('/:id', updateCustomer);

export default router;
