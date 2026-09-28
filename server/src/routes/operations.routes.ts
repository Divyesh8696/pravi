import { Router } from 'express';
import { getOperations, getOperationById, startOperation, recordStop, completeOperation, createOperation, pauseOperation, resumeOperation } from '../controllers/operation.controller.js';
import { requireAuth, requireInternalRole } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth, requireInternalRole);

router.post('/', createOperation);
router.get('/', getOperations);
router.get('/:id', getOperationById);
router.post('/:id/start', startOperation);
router.post('/:id/pause', pauseOperation);
router.post('/:id/resume', resumeOperation);
router.post('/:id/stops', recordStop);
router.post('/:id/complete', completeOperation);

export default router;
