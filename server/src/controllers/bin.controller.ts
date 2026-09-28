import { Request, Response, NextFunction } from 'express';
import { Bin } from '../models/Bin.js';

export const getBins = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter: any = {};
    
    // RBAC: Zone Supervisor sees only their zone
    if (req.user?.role === 'ZONE_SUPERVISOR' && req.user.zoneId) {
      filter.zoneId = req.user.zoneId;
    }
    
    // Support filtering by collection point
    if (req.query.collectionPointId) {
      filter.collectionPointId = req.query.collectionPointId;
    }
    
    const bins = await Bin.find(filter).populate('zoneId wardId collectionPointId');
    res.json({ data: bins });
  } catch (error) {
    next(error);
  }
};

export const getBinById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bin = await Bin.findById(req.params.id).populate('zoneId wardId collectionPointId');
    if (!bin) return res.status(404).json({ error: { message: 'Not found' } });
    
    // RBAC check
    if (req.user?.role === 'ZONE_SUPERVISOR' && req.user.zoneId && bin.zoneId._id.toString() !== req.user.zoneId) {
      return res.status(403).json({ error: { message: 'Forbidden' } });
    }
    
    res.json({ data: bin });
  } catch (error) {
    next(error);
  }
};
export const createBin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bin = await Bin.create(req.body);
    res.status(201).json({ data: bin });
  } catch (error) {
    next(error);
  }
};

export const updateBin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bin = await Bin.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!bin) return res.status(404).json({ error: { message: 'Not found' } });
    res.json({ data: bin });
  } catch (error) {
    next(error);
  }
};

export const deleteBin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bin = await Bin.findByIdAndDelete(req.params.id);
    if (!bin) return res.status(404).json({ error: { message: 'Not found' } });
    res.json({ data: { success: true } });
  } catch (error) {
    next(error);
  }
};
