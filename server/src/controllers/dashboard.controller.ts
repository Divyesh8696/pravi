import { Request, Response, NextFunction } from 'express';
import { Route } from '../models/Route.js';
import { Vehicle } from '../models/Vehicle.js';
import { CollectionPoint } from '../models/CollectionPoint.js';
import { Complaint } from '../models/Complaint.js';
import { WorkOrder } from '../models/WorkOrder.js';
import { CollectionOperation } from '../models/CollectionOperation.js';
import { Bin } from '../models/Bin.js';
import { TransferStation } from '../models/TransferStation.js';

export const getDashboardKPIs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const filter: any = {};
    
    // RBAC Enforcement
    if (user.role === 'ZONE_SUPERVISOR' && user.zoneId) {
      filter.zoneId = user.zoneId;
    } else if (user.role === 'CONTRACTOR' && user.contractorId) {
      filter.contractorId = user.contractorId;
    }

    // 1. Routes
    const totalRoutes = await Route.countDocuments(filter);
    const activeRoutes = await Route.countDocuments({ ...filter, isActive: true });

    // 2. Vehicles
    const vehicles = await Vehicle.aggregate([
      { $match: filter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const vehicleStats = vehicles.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {});
    const totalVehicles = vehicles.reduce((sum, curr) => sum + curr.count, 0);

    // 3. Collection Points
    const totalPoints = await CollectionPoint.countDocuments(filter);

    // 4. Complaints & Work Orders
    const openComplaints = await Complaint.countDocuments({ ...filter, status: { $in: ['OPEN', 'IN_PROGRESS', 'ASSIGNED'] } });
    const openWorkOrders = await WorkOrder.countDocuments({ ...filter, status: { $in: ['OPEN', 'IN_PROGRESS', 'ASSIGNED'] } });

    // 5. Operations (Requires Route lookup for Zone filtering)
    let opsFilter: any = {};
    if (filter.zoneId || filter.contractorId) {
      const allowedRoutes = await Route.find(filter).select('_id');
      opsFilter.routeId = { $in: allowedRoutes.map(r => r._id) };
    }
    
    const activeOps = await CollectionOperation.find({ ...opsFilter, status: 'IN_PROGRESS' });
    const totalStops = activeOps.reduce((acc, op) => acc + op.totalStops, 0);
    const collectedStops = activeOps.reduce((acc, op) => acc + op.collectedCount, 0);
    const progress = totalStops > 0 ? Math.round((collectedStops / totalStops) * 100) : 0;
    const missedStops = activeOps.reduce((acc, op) => acc + op.missedCount, 0);

    res.json({
      data: {
        routes: { total: totalRoutes, active: activeRoutes },
        vehicles: {
          total: totalVehicles,
          available: vehicleStats['AVAILABLE'] || 0,
          active: vehicleStats['ON_ROUTE'] || 0,
          breakdown: vehicleStats['BREAKDOWN'] || 0,
          maintenance: vehicleStats['UNDER_MAINTENANCE'] || 0,
        },
        points: { total: totalPoints },
        complaints: { open: openComplaints },
        workOrders: { open: openWorkOrders },
        operations: {
          activeCount: activeOps.length,
          progressPercent: progress,
          missedStops: missedStops
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getMapAssets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter: any = {};
    if (req.user?.role === 'ZONE_SUPERVISOR' && req.user.zoneId) {
      filter.zoneId = req.user.zoneId;
    }

    const [vehicles, bins, complaints, destinations] = await Promise.all([
      Vehicle.find({ ...filter, status: 'ON_ROUTE' }).select('code status lat lng'),
      Bin.find({ ...filter, status: { $in: ['OVERFLOWING', 'MAINTENANCE'] } }).select('binId name type status fillLevel lat lng'),
      Complaint.find({ ...filter, status: { $in: ['OPEN', 'IN_PROGRESS'] } }).select('code category status lat lng'),
      TransferStation.find(filter).select('code name facilityType status lat lng')
    ]);

    const mappedVehicles = vehicles.filter((v: any) => v.lat && v.lng).map((v: any) => ({ _id: v._id, code: v.code, name: 'Active Vehicle', type: 'VEHICLE', lat: v.lat, lng: v.lng, status: v.status, isTruck: true }));
    const mappedBins = bins.map(b => ({ _id: b._id, code: b.binId, name: b.name, type: b.type, lat: b.lat, lng: b.lng, status: b.status, condition: `${b.fillLevel}% FULL` }));
    const mappedComplaints = complaints.filter(c => c.lat && c.lng).map(c => ({ _id: c._id, code: c.code, name: 'Complaint', type: 'COMPLAINT', lat: c.lat, lng: c.lng, status: c.status }));
    const mappedDestinations = destinations.map(d => ({ _id: d._id, code: d.code, name: d.name, type: 'DESTINATION', lat: d.lat, lng: d.lng, status: d.status }));

    res.json({ data: [...mappedVehicles, ...mappedBins, ...mappedComplaints, ...mappedDestinations] });
  } catch (error) {
    next(error);
  }
};
