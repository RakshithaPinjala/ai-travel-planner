import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { Trip } from '../models/Trip';
import { generateItinerary } from '../services/aiService';

// @desc    Create new trip and generate itinerary
// @route   POST /api/trips
// @access  Private
export const createTrip = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { destination, startDate, durationDays, budgetTier, interests } = req.body;
    const userId = req.user?.id;

    // Call AI Service
    const aiData = await generateItinerary(destination, durationDays, budgetTier, interests);

    const trip = await Trip.create({
      userId,
      destination,
      startDate,
      durationDays,
      budgetTier,
      interests,
      itinerary: aiData.itinerary,
      hotels: aiData.hotels,
      estimatedBudget: aiData.estimatedBudget,
      packingList: aiData.packingList,
    });

    res.status(201).json(trip);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create trip', error });
  }
};

// @desc    Get all trips for user
// @route   GET /api/trips
// @access  Private
export const getTrips = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const trips = await Trip.find({ userId: req.user?.id }).sort({ createdAt: -1 });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch trips', error });
  }
};

// @desc    Get trip by ID
// @route   GET /api/trips/:id
// @access  Private
export const getTripById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (trip && trip.userId.toString() === req.user?.id) {
      res.json(trip);
    } else {
      res.status(404).json({ message: 'Trip not found or unauthorized' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch trip', error });
  }
};

// @desc    Delete trip
// @route   DELETE /api/trips/:id
// @access  Private
export const deleteTrip = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (trip && trip.userId.toString() === req.user?.id) {
      await trip.deleteOne();
      res.json({ message: 'Trip removed' });
    } else {
      res.status(404).json({ message: 'Trip not found or unauthorized' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete trip', error });
  }
};

// @desc    Regenerate a specific day
// @route   POST /api/trips/:id/regenerate-day
// @access  Private
export const regenerateDay = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { dayNumber, promptOverride } = req.body;
    const trip = await Trip.findById(req.params.id);

    if (trip && trip.userId.toString() === req.user?.id) {
      const regeneratedData = await require('../services/aiService').regenerateDayAI(
        trip.destination,
        dayNumber,
        promptOverride
      );

      const dayIndex = trip.itinerary.findIndex((day: any) => day.dayNumber === dayNumber);
      if (dayIndex !== -1) {
        trip.itinerary[dayIndex] = regeneratedData;
        
        // Explicitly mark itinerary as modified since it's an array of Mixed type
        trip.markModified('itinerary');
        
        await trip.save();
        res.json(trip);
      } else {
        res.status(404).json({ message: 'Day not found in itinerary' });
      }
    } else {
      res.status(404).json({ message: 'Trip not found or unauthorized' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to regenerate day', error });
  }
};

// @desc    Add a manual activity
// @route   POST /api/trips/:id/add-activity
// @access  Private
export const addActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { dayNumber, activity } = req.body;
    const trip = await Trip.findById(req.params.id);

    if (trip && trip.userId.toString() === req.user?.id) {
      const dayIndex = trip.itinerary.findIndex((day: any) => day.dayNumber === dayNumber);
      if (dayIndex !== -1) {
        trip.itinerary[dayIndex].activities.push(activity);
        trip.markModified('itinerary');
        await trip.save();
        res.json(trip);
      } else {
        res.status(404).json({ message: 'Day not found in itinerary' });
      }
    } else {
      res.status(404).json({ message: 'Trip not found or unauthorized' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to add activity', error });
  }
};

// @desc    Remove an activity
// @route   DELETE /api/trips/:id/activity/:activityIndex
// @access  Private
export const removeActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const activityIndex = parseInt(String(req.params.activityIndex), 10);
    const dayNumber = parseInt(String(req.query.dayNumber), 10);

    const trip = await Trip.findById(req.params.id);

    if (trip && trip.userId.toString() === req.user?.id) {
      const dayIndex = trip.itinerary.findIndex((day: any) => day.dayNumber === dayNumber);
      if (dayIndex !== -1) {
        trip.itinerary[dayIndex].activities.splice(activityIndex, 1);
        trip.markModified('itinerary');
        await trip.save();
        res.json(trip);
      } else {
        res.status(404).json({ message: 'Day not found in itinerary' });
      }
    } else {
      res.status(404).json({ message: 'Trip not found or unauthorized' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove activity', error });
  }
};

// @desc    Toggle packing list item
// @route   PATCH /api/trips/:id/packing-list
// @access  Private
export const togglePackingItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { itemIndex, packed } = req.body;
    const trip = await Trip.findById(req.params.id);

    if (trip && trip.userId.toString() === req.user?.id) {
      if (trip.packingList[itemIndex]) {
        trip.packingList[itemIndex].packed = packed;
        trip.markModified('packingList');
        await trip.save();
        res.json(trip);
      } else {
        res.status(404).json({ message: 'Packing list item not found' });
      }
    } else {
      res.status(404).json({ message: 'Trip not found or unauthorized' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to update packing list', error });
  }
};
