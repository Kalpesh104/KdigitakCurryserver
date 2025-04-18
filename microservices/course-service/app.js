const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const Consul = require('consul');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/courses', require('./routes/courses'));

const PORT = parseInt(process.env.PORT, 10) || 5001;
const SERVICE_ID = 'course-service-id';
const SERVICE_NAME = 'course-service';

// Initialize Consul client
const consul = new Consul({
  host: process.env.CONSUL_HOST || 'consul',
  port: process.env.CONSUL_PORT || '8500',
  promisify: true
});

// Register service with Consul
async function registerService() {
  try {
    await consul.agent.service.register({
      name: SERVICE_NAME,
      id: SERVICE_ID,
      address: SERVICE_NAME,      // Docker-compose service name
      port: PORT,
      tags: ['course', 'api'],
      check: {
        http: `http://${SERVICE_NAME}:${PORT}/api/courses`, // simple health check
        interval: '10s',
        timeout: '5s'
      }
    });
    console.log(`✅ Registered ${SERVICE_NAME} with Consul`);
  } catch (err) {
    console.error('❌ Consul registration failed:', err);
    process.exit(1);
  }
}

// Deregister on shutdown
async function deregisterService() {
  try {
    await consul.agent.service.deregister(SERVICE_ID);
    console.log(`🛑 Deregistered ${SERVICE_NAME} from Consul`);
    process.exit();
  } catch (err) {
    console.error('Error deregistering service:', err);
    process.exit(1);
  }
}

// Start server and register
app.listen(PORT, async () => {
  console.log(`🖥️  ${SERVICE_NAME} running on port ${PORT}`);
  await registerService();
});

// Handle graceful shutdown
process.on('SIGINT', deregisterService);
process.on('SIGTERM', deregisterService);
