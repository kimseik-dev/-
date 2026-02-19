import express from 'express';
import { deletePlan } from '../../../../../controllers/planController';

const router = express.Router();

router.delete('/:id', deletePlan);

export default router;
