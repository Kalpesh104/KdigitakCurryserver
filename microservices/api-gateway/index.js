const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const axios = require('axios');
const Consul = require('consul');
const app = express();
const PORT = 5000;

const consul = new Consul({ host: 'consul', port: 8500 });

// Function to fetch the service URL from Consul
const getServiceUrl = async (serviceName) => {
  try {
    const services = await consul.agent.service.list();
    const service = services[serviceName];

    if (!service) {
      console.error(`Service ${serviceName} not found in Consul`);
      return null;
    }
    return `http://${service.Address}:${service.Port}`;
  } catch (error) {
    console.error('Error fetching service from Consul:', error);
    return null;
  }
};

// Dynamic proxy middleware
const setupProxy = async () => {
  const services = ['course-service', 'instructor-service', 'lecture-service', 'user-service'];

  // Loop through the services and dynamically set up proxy routes
  for (const service of services) {
    const targetUrl = await getServiceUrl(service);

    if (targetUrl) {
      app.use(`/${service}`, createProxyMiddleware({
        target: targetUrl,
        changeOrigin: true,
        pathRewrite: {
          [`^/${service}`]: '', // Remove the service prefix from the path
        },
        onProxyReq: (proxyReq, req, res) => {
          console.log(`Routing request for ${service}: ${req.url}`);
        },
      }));
    }
  }
};

// Initialize proxies once the services are known
setupProxy().then(() => {
  app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
  });
});
