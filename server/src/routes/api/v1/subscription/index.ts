import { Router } from 'express';
import { deleteSubscription } from '../../../../controllers/subscriptionController';

const router = Router();

router.delete('/:id', deleteSubscription);

export default router;
