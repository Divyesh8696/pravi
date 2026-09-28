import { Router } from 'express';
import { getVehicles, getVehicleById, updateVehicleStatus, createVehicle, updateVehicle, deleteVehicle } from '../controllers/vehicle.controller.js';
import { requireAuth, requireInternalRole } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth, requireInternalRole);

router.get('/', getVehicles);
router.post('/', createVehicle);
router.get('/:id', getVehicleById);
router.put('/:id', updateVehicle);
router.delete('/:id', deleteVehicle);
router.post('/:id/status', updateVehicleStatus);

export default router;
