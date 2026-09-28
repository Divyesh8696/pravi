import { Router } from 'express';
import { getRoutes, getRouteById, createRoute, updateRoute, deleteRoute } from '../controllers/route.controller.js';
import { requireAuth, requireInternalRole } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth, requireInternalRole);

router.get('/', getRoutes);
router.post('/', createRoute);
router.get('/:id', getRouteById);
router.put('/:id', updateRoute);
router.delete('/:id', deleteRoute);

export default router;
