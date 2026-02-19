import { Router } from 'express';
import { addSubscription } from '../../../../../controllers/subscriptionController';

const router = Router();

router.post('/', addSubscription);

export default router;
