import express from 'express';
import {
  createTrip,
  getTrips,
  getTripById,
  deleteTrip,
  regenerateDay,
  addActivity,
  removeActivity
} from '../controllers/tripController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
  .post(protect, createTrip)
  .get(protect, getTrips);

router.route('/:id')
  .get(protect, getTripById)
  .delete(protect, deleteTrip);

router.post('/:id/regenerate-day', protect, regenerateDay);
router.post('/:id/add-activity', protect, addActivity);
router.delete('/:id/activity/:activityIndex', protect, removeActivity);
router.patch('/:id/packing-list', protect, require('../controllers/tripController').togglePackingItem);

export default router;
