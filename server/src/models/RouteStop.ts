import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IRouteStop extends Document {
  routeId: Types.ObjectId;
  collectionPointId: Types.ObjectId;
  sequence: number;
  createdAt: Date;
  updatedAt: Date;
}

const RouteStopSchema = new Schema<IRouteStop>(
  {
    routeId: { type: Schema.Types.ObjectId, ref: 'Route', required: true, index: true },
    collectionPointId: {
      type: Schema.Types.ObjectId,
      ref: 'CollectionPoint',
      required: true,
      unique: true, // Non-negotiable invariant: point on exactly one route
    },
    sequence: { type: Number, required: true },
  },
  {
    timestamps: true,
    strict: true,
  }
);

RouteStopSchema.index({ routeId: 1, sequence: 1 });

export const RouteStop = mongoose.model<IRouteStop>('RouteStop', RouteStopSchema);
