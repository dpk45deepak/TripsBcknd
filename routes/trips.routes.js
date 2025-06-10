import express from 'express';
import {
  getDomesticTrips,
  postDomesticTrips,
  getForeignTrips,
  postForeignTrips
} from '../controllers/trips.controller.js';

const router = express.Router();

// Domestic Trips Routes
router.get('/domestic-trips', getDomesticTrips);
router.post('/domestic-trips', postDomesticTrips);

// Foreign Trips Routes
router.get('/foreign-trips', getForeignTrips);
router.post('/foreign-trips', postForeignTrips);

export default router;