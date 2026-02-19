import { Router } from 'express';
import { setRandomSubscriptionDueToday } from '../../../../../controllers/debugController';

const router = Router();

router.post('/', setRandomSubscriptionDueToday);

export default router;
