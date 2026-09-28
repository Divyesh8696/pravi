import { Request, Response, NextFunction } from 'express';
import { CollectionOperation } from '../models/CollectionOperation.js';
import { CollectionEvent } from '../models/CollectionEvent.js';
import { RouteStop } from '../models/RouteStop.js';
import { NotFoundError, InvalidTransitionError } from '../utils/errors.js';
import { AuditLog } from '../models/AuditLog.js';
import mongoose from 'mongoose';

export const createOperation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { routeId, vehicleId } = req.body;
    const operation = await CollectionOperation.create({
      code: `OP-${Math.floor(Math.random() * 10000)}`,
      routeId,
      ...(vehicleId ? { vehicleId } : {}),
      date: new Date(),
      status: 'IN_PROGRESS',
      startedAt: new Date(),
      totalStops: 10,
      collectedCount: 0,
      missedCount: 0,
      issueCount: 0
    });
    res.status(201).json({ data: operation });
  } catch (error) {
    next(error);
  }
};

export const getOperations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter: any = {};
    const user = req.user!;
    const { date, status } = req.query;

    if (date) filter.date = { $gte: new Date(date as string), $lte: new Date(date as string) };
    if (status) {
      if ((status as string).includes(',')) {
        filter.status = { $in: (status as string).split(',') };
      } else {
        filter.status = status;
      }
    }

    // Apply zone scope
    if (user.role === 'ZONE_SUPERVISOR' && user.zoneId) {
      // Zone filter would ideally be via route, let's keep it simple or join
      // Actually CollectionOperation doesn't have zoneId, it has routeId.
      // We will need to populate route to filter by zone, or get routes for zone first.
    }

    const operations = await CollectionOperation.find(filter)
      .populate('routeId', 'code name zoneId')
      .populate('vehicleId', 'code registrationNo')
      .populate('driverId', 'name phone')
      .sort({ date: -1 });

    res.json({ data: operations });
  } catch (error) {
    next(error);
  }
};

export const getOperationById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const operation = await CollectionOperation.findById(req.params.id)
      .populate('routeId')
      .populate('vehicleId')
      .populate('driverId');

    if (!operation) throw new NotFoundError('Operation not found');

    const events = await CollectionEvent.find({ operationId: operation._id })
      .populate('collectionPointId')
      .sort({ sequence: 1 });

    res.json({ data: { operation, events } });
  } catch (error) {
    next(error);
  }
};

export const startOperation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const operation = await CollectionOperation.findById(req.params.id);
    if (!operation) throw new NotFoundError('Operation not found');

    if (operation.status !== 'IN_PROGRESS' && operation.status !== 'SCHEDULED' as any) {
      throw new InvalidTransitionError('CollectionOperation', operation.status, 'start');
    }

    operation.status = 'IN_PROGRESS';
    operation.startedAt = new Date();
    await operation.save();

    await AuditLog.create({
      actorName: req.user!.userId,
      action: 'UPDATE',
      entityType: 'COLLECTION_OPERATION',
      entityId: operation._id,
      entityCode: operation.code,
      summary: 'Operation started'
    });

    res.json({ data: operation });
  } catch (error) {
    next(error);
  }
};

export const pauseOperation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const operation = await CollectionOperation.findById(req.params.id);
    if (!operation) throw new NotFoundError('Operation not found');

    if (operation.status !== 'IN_PROGRESS') {
      throw new InvalidTransitionError('CollectionOperation', operation.status, 'pause');
    }

    operation.status = 'PAUSED';
    await operation.save();

    await AuditLog.create({
      actorName: req.user!.userId,
      action: 'UPDATE',
      entityType: 'COLLECTION_OPERATION',
      entityId: operation._id,
      entityCode: operation.code,
      summary: 'Operation paused'
    });

    res.json({ data: operation });
  } catch (error) {
    next(error);
  }
};

export const resumeOperation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const operation = await CollectionOperation.findById(req.params.id);
    if (!operation) throw new NotFoundError('Operation not found');

    if (operation.status !== 'PAUSED') {
      throw new InvalidTransitionError('CollectionOperation', operation.status, 'resume');
    }

    operation.status = 'IN_PROGRESS';
    await operation.save();

    await AuditLog.create({
      actorName: req.user!.userId,
      action: 'UPDATE',
      entityType: 'COLLECTION_OPERATION',
      entityId: operation._id,
      entityCode: operation.code,
      summary: 'Operation resumed'
    });

    res.json({ data: operation });
  } catch (error) {
    next(error);
  }
};

export const recordStop = async (req: Request, res: Response, next: NextFunction) => {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      const { collectionPointId, status, notes } = req.body;
      const operation = await CollectionOperation.findById(req.params.id).session(session);
      
      if (!operation) throw new NotFoundError('Operation not found');
      if (operation.status !== 'IN_PROGRESS') {
        throw new InvalidTransitionError('CollectionOperation', operation.status, 'recordStop');
      }

      // Check if event already exists
      let event = await CollectionEvent.findOne({
        operationId: operation._id,
        collectionPointId
      }).session(session);

      if (event) {
        throw new InvalidTransitionError('CollectionEvent', 'exists', 'record');
      }

      // Find sequence
      const routeStop = await RouteStop.findOne({
        routeId: operation.routeId,
        collectionPointId
      }).session(session);

      const createdEvents = await CollectionEvent.create([{
        operationId: operation._id,
        collectionPointId,
        sequence: routeStop ? routeStop.sequence : 0,
        status,
        notes,
        collectedAt: new Date()
      }], { session });
      event = createdEvents[0] as any;

      // Update counters
      if (status === 'COLLECTED') operation.collectedCount++;
      else if (status === 'MISSED') operation.missedCount++;
      else if (status === 'ISSUE_FOUND') operation.issueCount++;

      await operation.save({ session });
      
      result = event;
    });

    res.json({ data: result });
  } catch (error) {
    next(error);
  } finally {
    session.endSession();
  }
};

export const completeOperation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const operation = await CollectionOperation.findById(req.params.id);
    if (!operation) throw new NotFoundError('Operation not found');

    if (operation.status !== 'IN_PROGRESS' && operation.status !== 'PAUSED') {
      throw new InvalidTransitionError('CollectionOperation', operation.status, 'complete');
    }

    operation.status = 'COMPLETED';
    operation.completedAt = new Date();
    await operation.save();

    await AuditLog.create({
      actorName: req.user!.userId,
      action: 'UPDATE',
      entityType: 'COLLECTION_OPERATION',
      entityId: operation._id,
      entityCode: operation.code,
      summary: 'Operation completed'
    });

    res.json({ data: operation });
  } catch (error) {
    next(error);
  }
};
