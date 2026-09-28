import { Request, Response, NextFunction } from 'express';
import { WorkOrder } from '../models/WorkOrder.js';

export const updateWorkOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const workOrder = await WorkOrder.findByIdAndUpdate(req.params.id, {
      status,
      ...(status === 'COMPLETED' ? { completedAt: new Date() } : {})
    }, { new: true });
    res.json({ data: workOrder });
  } catch (error) {
    next(error);
  }
};

export const getWorkOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter: any = {};
    const user = req.user!;
    if (user.role === 'ZONE_SUPERVISOR' && user.zoneId) filter.zoneId = user.zoneId;
    
    const workOrders = await WorkOrder.find(filter)
      .populate('zoneId')
      .populate('assignedWorkerId')
      .populate('createdById')
      .sort({ createdAt: -1 });

    res.json({ data: workOrders });
  } catch (error) {
    next(error);
  }
};

export const getWorkOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workOrder = await WorkOrder.findById(req.params.id)
      .populate('zoneId')
      .populate('assignedWorkerId')
      .populate('createdById');
      
    if (!workOrder) return res.status(404).json({ error: { message: 'Not found' } });
    res.json({ data: workOrder });
  } catch (error) {
    next(error);
  }
};

