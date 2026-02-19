import express from 'express';
import { createPlan } from '../../../../../controllers/planController';

const router = express.Router();

router.post('/', createPlan);

export default router;
