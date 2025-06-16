# 🌍 Travel Assistant API

A smart travel backend built with **Node.js + Express** that combines **geolocation**, **weather forecasts**, and **facility information** to help users plan trips based on their selected city and state.

---

## 🚀 Features

- 🔍 **Geolocation Search**  
  Get latitude & longitude of a city using Open-Meteo's free geocoding API.

- 🌦 **Weather Forecast**  
  Fetch 5-day daily max/min temperature forecasts using Open-Meteo’s weather API.

- 🏥 **Nearby Facilities & Landmarks**  
  Uses OpenStreetMap Nominatim API to get nearby points of interest.

- 🛡️ **Security & Rate Limiting**  
  Prevents abuse with express-rate-limit and CORS configuration.

- 📦 **Organized API Structure**  
  Express.js server with routes for `/location-info`, preferences for trips, and static view.

---

## 📁 Folder Structure

---

├── views/                  # EJS views for testing (index.ejs, docs.ejs)
├── public/                 # Static files (CSS, JS, images)
├── src/
│   ├── controllers/        # Route controllers (e.g., trips.controller.js)
│   ├── models/             # Mongoose models (e.g., trips.models.js)
│   ├── routes/             # Express route files
│   ├── DBConfig/           # Database config (e.g., DBconfig.js)
│   └── app.js              # Express app setup
├── DomesticTrip.json       # Sample preference file (domestic)
├── ForeignTrip.json        # Sample preference file (foreign)
├── index.js                # Main server file (entry point)
├── package.json
└── README.md

---

## 🔗 Sample API Usage

**GET** `/location-info?city=faridabad&state=ap`

### ✅ Example Response:
```json
{
  "location": {
    "city": "Faridabad",
    "state": "Andhra Pradesh",
    "country": "India",
    "latitude": 28.41,
    "longitude": 77.31
  },
  "weather": {
    "temperature_2m_max": [...],
    "temperature_2m_min": [...]
  },
  "facilities": [ {...}, {...}, ... ]
}
```

---

## ⚙️ How to Run Locally

```bash
git clone https://github.com/your-username/travel-assistant-api.git
cd travel-assistant-api
npm install
npm run dev
```

Server will run on: `http://localhost:4041`


## 📦 Dependencies

- express
- axios
- cors
- express-rate-limit
- morgan
- ejs
- fs (Node.js built-in)
- path (Node.js built-in)


## 📄 License

This project is open for educational and personal use. Please credit the public APIs used.

---

## 🙋‍♂️ Author

**Deepak Kumar**  
🚀 B.Tech CSE | Backend Developer and ML engineer
📧 `dpk.41deep@gmail.com`

---
