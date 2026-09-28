import { Router } from 'express';
import { getComplaints, getComplaintById, createComplaint, resolveComplaint } from '../controllers/complaint.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.post('/', createComplaint);
router.get('/', getComplaints);
router.get('/:id', getComplaintById);
router.post('/:id/resolve', resolveComplaint);

export default router;
