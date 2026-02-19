import express from 'express';
import { updatePlan, togglePlanStatus } from '../../../../../controllers/planController';

const router = express.Router();

router.put('/:id', updatePlan);
router.patch('/:id/status', togglePlanStatus);

export default router;
