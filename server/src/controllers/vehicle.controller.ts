import { Request, Response, NextFunction } from 'express';
import { Vehicle } from '../models/Vehicle.js';

export const updateVehicleStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json({ data: vehicle });
  } catch (error) {
    next(error);
  }
};

export const getVehicles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter: any = {};
    const user = req.user!;
    if (user.role === 'ZONE_SUPERVISOR' && user.zoneId) filter.zoneId = user.zoneId;
    if (user.role === 'CONTRACTOR' && user.contractorId) filter.contractorId = user.contractorId;

    const vehicles = await Vehicle.find(filter)
      .populate('zoneId')
      .populate('contractorId')
      .sort({ code: 1 });

    res.json({ data: vehicles });
  } catch (error) {
    next(error);
  }
};

export const getVehicleById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('zoneId')
      .populate('contractorId');
      
    if (!vehicle) return res.status(404).json({ error: { message: 'Not found' } });
    res.json({ data: vehicle });
  } catch (error) {
    next(error);
  }
};

export const createVehicle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json({ data: vehicle });
  } catch (error) {
    next(error);
  }
};

export const updateVehicle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!vehicle) return res.status(404).json({ error: { message: 'Not found' } });
    res.json({ data: vehicle });
  } catch (error) {
    next(error);
  }
};

export const deleteVehicle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) return res.status(404).json({ error: { message: 'Not found' } });
    res.json({ data: { success: true } });
  } catch (error) {
    next(error);
  }
};
