import { DomesticTrip, ForeignTrip } from '../models/trips.models.js';

// Helper functions
const buildAndFilter = ({ budget, health, age, days }) => {
  const filter = {};
  if (budget) filter.budget = Number(budget);
  if (health) filter.health = health.toLowerCase();
  if (age)    filter.age = Number(age);
  if (days)   filter.days = Number(days);
  return filter;
};

const buildOrFilter = ({ budget, health, age, days }) => {
  const orConditions = [];
  if (budget) orConditions.push({ budget: Number(budget) });
  if (health) orConditions.push({ health: health.toLowerCase() });
  if (age)    orConditions.push({ age: Number(age) });
  if (days)   orConditions.push({ days: Number(days) });
  return orConditions.length ? { $or: orConditions } : {};
};

// Domestic Trips
export const getDomesticTrips = async (req, res) => {
  try {
    const reqFilter = buildOrFilter(req.query);
    const trips = await DomesticTrip.find(reqFilter);
    res.json(trips);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

export const postDomesticTrips = async (req, res) => {
  try {
    const reqFilter = buildOrFilter(req.body);
    const trips = await DomesticTrip.find(reqFilter);
    res.json(trips);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Foreign Trips
export const getForeignTrips = async (req, res) => {
  try {
    const reqFilter = buildOrFilter(req.query);
    const trips = await ForeignTrip.find(reqFilter);
    res.json(trips);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

export const postForeignTrips = async (req, res) => {
  try {
    const reqFilter = buildOrFilter(req.body);
    const trips = await ForeignTrip.find(reqFilter);
    res.json(trips);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};