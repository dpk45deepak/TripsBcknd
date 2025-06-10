import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();


// router.get('/info/:destination', async (req, res) => {
//   const destination = req.params.destination;
//   // Placeholder for fetching destination information
//   const info = { name: destination, description: `Information about ${destination}` }; 
//   res.json(info);
// });


// Route: GET /location-info?city=CityName&state=StateName
router.get('/', async (req, res) => {
  const { city, state } = req.query;

  if (!city || !state) {
    return res.status(400).json({ error: "Both city and state are required." });
  }

  try {
    // Geocoding to get lat/lon
    const geoUrl = `${process.env.GEO_URL}?name=${encodeURIComponent(city)}&count=1`;
    const geoRes = await axios.get(geoUrl);

    const locationData = geoRes.data?.results?.[0];
    if (!locationData) {
      return res.status(404).json({ error: "Location not found." });
    }

    const { latitude, longitude, name, admin1, country } = locationData;

    // Use OpenStreetMap Nominatim for facility/location details
    const nominatimQuery = `${name}, ${admin1}, ${country}`;
    const nominatimUrl = `${process.env.NOMINATIM_URL}${encodeURIComponent(nominatimQuery)}`;
    const nominatimRes = await axios.get(nominatimUrl, {
      headers: { 'User-Agent': 'TripPlanner/1.0 (dpk.41deep@gmail.com)' }
    });

    // Fetch weather forecast
    const weatherUrl = `${process.env.WEATHER_URL}/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
    const weatherRes = await axios.get(weatherUrl);

    // Respond with collected data
    res.json({
      location: {
        city: name,
        state: admin1,
        country,
        latitude,
        longitude
      },
      weather: weatherRes.data?.daily || {},
      facilities: nominatimRes.data || []
    });

  } catch (error) {
    console.error("❌ Error in /location-info route:", error.message);
    res.status(500).json({
      error: "Internal server error",
      details: error.message
    });
  }
});

export default router;
