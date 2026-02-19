import { Router } from 'express';
import { deleteCustomer } from '../../../../../controllers/customerController';

const router = Router();

router.delete('/:id', deleteCustomer);

export default router;
