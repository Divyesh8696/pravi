import { Router } from 'express';
import { requireAuth, requireInternalRole } from '../middleware/auth.middleware.js';
import { getDashboardKPIs, getMapAssets } from '../controllers/dashboard.controller.js';

const router = Router();

router.use(requireAuth, requireInternalRole);

router.get('/kpis', getDashboardKPIs);
router.get('/map-assets', getMapAssets);

export default router;
