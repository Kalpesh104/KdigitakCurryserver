const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();
const PORT = 5000;

// Proxy settings for each microservice
const services = {
  'course-service': 'http://course-service:5001',
  'instructor-service': 'http://instructor-service:5002',
  'lecture-service': 'http://lecture-service:5003',
  'user-service': 'http://user-service:5004'
};

// Dynamically set up routes for each microservice
for (const [service, target] of Object.entries(services)) {
  app.use(`/${service}`, createProxyMiddleware({
    target: target,
    changeOrigin: true,
    pathRewrite: {
      [`^/${service}`]: '',
    },
    onProxyReq: (proxyReq, req, res) => {
      // You can modify headers or logging here
      console.log(`Routing request for ${service}: ${req.url}`);
    }
  }));
}
const axios = require('axios');
const Consul = require('consul');
const consul = new Consul({ host: 'consul', port: 8500 });

const getServiceUrl = async (serviceName) => {
  try {
    const services = await consul.agent.service.list();
    const service = services[serviceName];
    return `http://${service.Address}:${service.Port}`;
  } catch (error) {
    console.error('Error fetching service from Consul:', error);
    return null;
  }
};

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
