import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../utils/errors.js';

export type Role =
  | 'ADMIN'
  | 'OPS_MANAGER'
  | 'ZONE_SUPERVISOR'
  | 'FIELD_WORKER'
  | 'CONTRACTOR'
  | 'MANAGEMENT';

export const requireRole = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      
      if (!user) {
        throw new ForbiddenError('Not authenticated');
      }

      if (!allowedRoles.includes(user.role as Role)) {
        throw new ForbiddenError('Insufficient permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const requireZoneScope = (getZoneId: (req: Request) => string | undefined) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) throw new ForbiddenError('Not authenticated');

      if (user.role === 'ADMIN' || user.role === 'OPS_MANAGER' || user.role === 'MANAGEMENT') {
        return next();
      }

      const targetZoneId = getZoneId(req);
      if (user.zoneId && targetZoneId && user.zoneId !== targetZoneId) {
        throw new ForbiddenError('Access denied for this zone');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const requireContractorScope = (getContractorId: (req: Request) => string | undefined) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) throw new ForbiddenError('Not authenticated');

      if (user.role !== 'CONTRACTOR') {
        return next(); // Other roles handles by role/zone scopes
      }

      const targetContractorId = getContractorId(req);
      if (user.contractorId && targetContractorId && user.contractorId !== targetContractorId) {
        throw new ForbiddenError('Access denied for this contractor');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
