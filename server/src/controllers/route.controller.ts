import { Request, Response, NextFunction } from 'express';
import { Route } from '../models/Route.js';
import { RouteStop } from '../models/RouteStop.js';

export const getRoutes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter: any = {};
    const user = req.user!;
    
    // Apply zone scope
    if (user.role === 'ZONE_SUPERVISOR' && user.zoneId) {
      filter.zoneId = user.zoneId;
    }
    
    // Apply contractor scope
    if (user.role === 'CONTRACTOR' && user.contractorId) {
      filter.contractorId = user.contractorId;
    }

    const routes = await Route.find(filter)
      .populate('zoneId', 'code name')
      .populate('shiftId', 'name startTime endTime')
      .populate('contractorId', 'code name')
      .populate('destinationId', 'code name location type status')
      .sort({ createdAt: -1 });

    res.json({ data: routes });
  } catch (error) {
    next(error);
  }
};

export const getRouteById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const route = await Route.findById(req.params.id)
      .populate('zoneId', 'code name')
      .populate('shiftId', 'name startTime endTime')
      .populate('contractorId', 'code name')
      .populate('destinationId');

    if (!route) {
      return res.status(404).json({ error: { message: 'Route not found' } });
    }

    // Verify scope
    const user = req.user!;
    if (user.role === 'ZONE_SUPERVISOR' && user.zoneId && route.zoneId._id.toString() !== user.zoneId) {
      return res.status(404).json({ error: { message: 'Route not found' } }); // disguise forbidden as 404
    }
    if (user.role === 'CONTRACTOR' && user.contractorId && route.contractorId?._id.toString() !== user.contractorId) {
      return res.status(404).json({ error: { message: 'Route not found' } });
    }

    const stops = await RouteStop.find({ routeId: route._id })
      .populate('collectionPointId')
      .sort({ sequence: 1 });

    res.json({ data: { route, stops } });
  } catch (error) {
    next(error);
  }
};
export const createRoute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const route = await Route.create(req.body);
    res.status(201).json({ data: route });
  } catch (error) {
    next(error);
  }
};

export const updateRoute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const route = await Route.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!route) return res.status(404).json({ error: { message: 'Not found' } });
    res.json({ data: route });
  } catch (error) {
    next(error);
  }
};

export const deleteRoute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const route = await Route.findByIdAndDelete(req.params.id);
    if (!route) return res.status(404).json({ error: { message: 'Not found' } });
    // Also delete stops associated with this route
    await RouteStop.deleteMany({ routeId: req.params.id });
    res.json({ data: { success: true } });
  } catch (error) {
    next(error);
  }
};
