import { Request, Response, NextFunction } from 'express';
import { Complaint } from '../models/Complaint.js';

export const createComplaint = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, location, imageUrl } = req.body;
    const user = req.user!;
    
    // Default placeholder assignment to Zone 1, Ward 1 for dummy complaints if not provided
    // In reality, this would be computed from geocoding the address
    const zoneId = '66f7d0800000000000000001'; 
    const wardId = '66f7d0800000000000000006';

    const complaint = await Complaint.create({
      code: `CMP-${Math.floor(Math.random() * 10000)}`,
      status: 'OPEN',
      channel: 'WEB',
      category: 'MISSED_COLLECTION',
      priority: 'MEDIUM',
      description: title + (description ? " - " + description : ""),
      address: location || '',
      imageUrl,
      citizenName: user.name || 'Citizen',
      reportedById: user.userId,
      zoneId,
      wardId,
      dueAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // Due in 48 hours
      reportedAt: new Date()
    });
    res.status(201).json({ data: complaint });
  } catch (error) {
    next(error);
  }
};

export const resolveComplaint = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, {
      status: 'RESOLVED',
      dateResolved: new Date()
    }, { new: true });
    res.json({ data: complaint });
  } catch (error) {
    next(error);
  }
};

export const getComplaints = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter: any = {};
    const user = req.user!;
    if (user.role === 'ZONE_SUPERVISOR' && user.zoneId) filter.zoneId = user.zoneId;
    if (user.role === 'CITIZEN') filter.reportedById = user.userId;

    const complaints = await Complaint.find(filter)
      .populate('zoneId')
      .populate('wardId')
      .sort({ createdAt: -1 });

    res.json({ data: complaints });
  } catch (error) {
    next(error);
  }
};

export const getComplaintById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('zoneId')
      .populate('wardId');
      
    if (!complaint) return res.status(404).json({ error: { message: 'Not found' } });
    
    const user = req.user!;
    if (user.role === 'CITIZEN' && complaint.reportedById?.toString() !== user.userId) {
      return res.status(404).json({ error: { message: 'Not found' } });
    }
    
    res.json({ data: complaint });
  } catch (error) {
    next(error);
  }
};
