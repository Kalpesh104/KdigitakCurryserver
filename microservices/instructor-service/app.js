const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
connectDB();
const Consul = require('consul');

const consul = new Consul({
  host: 'consul', // service name from docker-compose
  port: 8500
});

const registerService = () => {
  consul.agent.service.register('course-service', {
    id: 'course-service-id',
    tags: ['course', 'api'],
    address: 'course-service',
    port: 5001
  }, (err) => {
    if (err) {
      console.error('Failed to register service with Consul:', err);
    } else {
      console.log('Service registered with Consul');
    }
  });
};

// Call the registerService function on startup
registerService();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/instructors', require('./routes/instructors'));

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Instructor Service running on port ${PORT}`);
});
