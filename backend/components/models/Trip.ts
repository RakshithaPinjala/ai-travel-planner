import mongoose, { Document, Schema } from 'mongoose';

export interface ITrip extends Document {
  userId: mongoose.Types.ObjectId;
  destination: string;
  startDate: Date;
  durationDays: number;
  budgetTier: 'Low' | 'Medium' | 'High';
  interests: string[];
  itinerary: any[];
  hotels: any[];
  estimatedBudget: any;
  packingList: any[];
  createdAt: Date;
  updatedAt: Date;
}

const tripSchema = new Schema<ITrip>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    durationDays: {
      type: Number,
      required: true,
      min: 1,
    },
    budgetTier: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      required: true,
    },
    interests: [
      {
        type: String,
      },
    ],
    itinerary: [
      {
        type: Schema.Types.Mixed,
      },
    ],
    hotels: [
      {
        type: Schema.Types.Mixed,
      },
    ],
    estimatedBudget: {
      type: Schema.Types.Mixed,
    },
    packingList: [
      {
        type: Schema.Types.Mixed,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Trip = mongoose.model<ITrip>('Trip', tripSchema);
