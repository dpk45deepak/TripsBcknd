import express from 'express';
import path, { dirname }  from 'path';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import destination from './routes/AddInfo.routes.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import userRouter from './routes/user.routes.js'
import tripRouter from './routes/trips.routes.js'
import cookieParser from 'cookie-parser';


dotenv.config();


//  ------- Handling __dirname in ES modules-------
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const app = express();

// Configure rate limiter outside the request handler
const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: 'You have exceeded the 10 requests per hour limit!',
  standardHeaders: true,
  legacyHeaders: false,
});


// CORS middleware
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || origin === allowedUnlimitedOrigin || origin.startsWith(allowedUnlimitedOrigin)) {
        callback(null, true);
      } else {
        callback(null, true); // still allow others, but they'll be rate-limited
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);
const allowedUnlimitedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';

app.use(morgan('dev'));

// Dynamic rate limiter middleware: apply apiLimiter unless origin is unlimited
const dynamicLimiter = (req, res, next) => {
  const origin = req.headers.origin || '';
  const isUnlimitedOrigin = origin === allowedUnlimitedOrigin || origin.startsWith(allowedUnlimitedOrigin);
  
  if (isUnlimitedOrigin) {
    next(); // skip rate limiting
  }
  apiLimiter(req, res, next);
};

// Apply the rate limiter to all requests
// app.use(dynamicLimiter);

// Static files and views
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, "..", 'views'));
app.set('view engine', 'ejs');

// common middleware.
app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({ extended: true, limit: "16kb"}));
app.use(express.static("public"));
app.use(cookieParser());

// Default Routes
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/docs', (req, res) => {
  res.render('docs');
});

// random route
app.get('/api', (req, res) => {
  res.json({ msg: `Hello Developer it's Me..!! Deepak Kumar` });
});

// Weather & location info route
app.use('/location-info', destination);

// Trip info route
app.use('/preference', tripRouter);

app.use('/user', userRouter);

export default app;