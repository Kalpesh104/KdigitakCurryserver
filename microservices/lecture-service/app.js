const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const Consul = require('consul');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/lectures', require('./routes/lectures'));

const PORT = parseInt(process.env.PORT, 10) || 5003;
const SERVICE_NAME = 'lecture-service';
const SERVICE_ID   = 'lecture-service-id';

// Initialize Consul client (promisified)
const consul = new Consul({
  host: process.env.CONSUL_HOST || 'consul',
  port: process.env.CONSUL_PORT || '8500',
  promisify: true
});

async function registerService() {
  try {
    await consul.agent.service.register({
      name: SERVICE_NAME,
      id: SERVICE_ID,
      address: SERVICE_NAME,
      port: PORT,
      tags: ['lecture', 'api'],
      check: {
        http: `http://${SERVICE_NAME}:${PORT}/api/lectures`,
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

async function deregisterService() {
  try {
    await consul.agent.service.deregister(SERVICE_ID);
    console.log(`🛑 Deregistered ${SERVICE_NAME} from Consul`);
    process.exit(0);
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

// Graceful shutdown
process.on('SIGINT', deregisterService);
process.on('SIGTERM', deregisterService);
