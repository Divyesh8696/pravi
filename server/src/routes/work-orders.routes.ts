import { Router } from 'express';
import { getWorkOrders, getWorkOrderById, updateWorkOrderStatus } from '../controllers/work-order.controller.js';
import { requireAuth, requireInternalRole } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth, requireInternalRole);

router.get('/', getWorkOrders);
router.get('/:id', getWorkOrderById);
router.post('/:id/status', updateWorkOrderStatus);

export default router;
