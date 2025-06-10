// trip.models.js
import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  days: {
    type: Number,
    required: true,
    min: 1
  },
  budget: {
    type: Number,
    required: true,
    min: 0
  },
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 5
  },
  image: {
    type: String,
    required: true
  },
  health: {
    type: String,
    enum: ['good', 'moderate', 'poor'],
    required: true
  },
  age: {
    type: Number,
    required: true,
    min: 0
  },
  bestSeason: {
    type: String,
    required: true
  },
  transport: {
    type: String,
    required: true
  },
  activityLevel: {
    type: String,
    enum: ['low', 'moderate', 'high'],
    required: true
  },
  safetyRating: {
    type: Number,
    required: true,
    min: 0,
    max: 5
  }
}, {
  timestamps: true
});

// Creating separate models for domestic and foreign trips using the same schema
const DomesticTrip = mongoose.model('DomesticTrip', tripSchema, 'domesticTrips');
const ForeignTrip = mongoose.model('ForeignTrip', tripSchema, 'foreignTrips');

// Exporting them properly
export { DomesticTrip, ForeignTrip };
