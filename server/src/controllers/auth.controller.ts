import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { createSession } from '../utils/auth.js';
import { UnauthorizedError } from '../utils/errors.js';
import { env } from '../config/env.js';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      throw new UnauthorizedError('Email and password are required');
    }

    const user = await User.findOne({ email, isActive: true });
    
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const payload = {
      userId: user._id.toString(),
      role: user.role,
      zoneId: user.zoneId?.toString(),
      contractorId: user.contractorId?.toString()
    };

    const token = await createSession(payload);

    // Set cookie
    res.cookie('session', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    user.lastLoginAt = new Date();
    await user.save();

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        zoneId: user.zoneId,
        contractorId: user.contractorId
      },
      token
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.clearCookie('session');
    res.json({ message: 'Logout successful' });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const user = await User.findById(userId).select('-passwordHash');
    
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
};
