import { Router } from 'express';
import { modifySubscription } from '../../../../../controllers/subscriptionController';

const router = Router();

router.post('/', modifySubscription);

export default router;
