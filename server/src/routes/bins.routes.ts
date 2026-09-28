import { Router } from 'express';
import { getBins, getBinById, createBin, updateBin, deleteBin } from '../controllers/bin.controller.js';
import { requireAuth, requireInternalRole } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth, requireInternalRole);

router.get('/', getBins);
router.post('/', createBin);
router.get('/:id', getBinById);
router.put('/:id', updateBin);
router.delete('/:id', deleteBin);

export default router;
