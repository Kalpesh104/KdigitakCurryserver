require('dotenv').config(); // at the top if using dotenv package
require('dd-trace').init(); // must be above all other imports
require('newrelic'); // New Relic monitoring
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const client = require('prom-client'); // Prometheus client

// Importing routes
const instructorRoutes = require('./routes/instructors');
const courseRoutes = require('./routes/courses');
const lectureRoutes = require('./routes/lectures');
const authRoutes = require('./routes/auth');
const swaggerDocs = require('./swagger');

// Database connection
const connectDB = require('./config/db');

dotenv.config();
connectDB(); // Connect to the database

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use('/uploads', express.static('uploads'));

// Rate limiter for login (limit to 5 requests per IP in 15 minutes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many requests, please try again later.'
});

// Prometheus metrics setup
client.collectDefaultMetrics(); // Enable default metrics collection (memory, CPU, etc.)

// Custom metric: HTTP requests counter
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

// Middleware to count HTTP requests
app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestCounter.inc({
      method: req.method,
      route: req.route ? req.route.path : req.path,
      status: res.statusCode
    });
  });
  next();
});

// Routes
app.use('/api/auth', limiter, authRoutes);
app.use('/api/instructors', instructorRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lectures', lectureRoutes);
app.get('/test', (req, res) => res.send('Hello World!'));

// Metrics endpoint for Prometheus scraping
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
});
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Swagger documentation setup
swaggerDocs(app);

// Test API route
app.get('/api/test', (req, res) => {
  res.send('Hello from /api/test');
});
// Histogram for response time
const responseTimeHistogram = new client.Histogram({
  name: 'http_response_time_seconds',
  help: 'Response time in seconds',
  labelNames: ['method', 'route', 'status']
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));