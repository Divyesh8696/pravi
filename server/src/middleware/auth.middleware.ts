import { Request, Response, NextFunction } from 'express';
import { verifySession, SessionPayload } from '../utils/auth.js';
import { UnauthorizedError } from '../utils/errors.js';

declare global {
  namespace Express {
    interface Request {
      user?: SessionPayload;
    }
  }
}

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.session || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      throw new UnauthorizedError('Authentication required');
    }

    const payload = await verifySession(token);
    
    if (!payload) {
      throw new UnauthorizedError('Invalid or expired session');
    }

    req.user = payload;
    next();
  } catch (error) {
    next(error);
  }
};

export const requireInternalRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }
    
    if (req.user.role === 'CITIZEN') {
      return res.status(403).json({ error: { message: 'Forbidden. Citizens cannot access internal resources.' } });
    }
    
    next();
  } catch (error) {
    next(error);
  }
};
