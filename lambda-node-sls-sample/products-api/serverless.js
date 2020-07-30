const config = require('./config');
const logger = require('./logger');
const ExpressServer = require('./expressServer');

// https://www.serverless.com/blog/serverless-express-rest-api/#converting-an-existing-express-application
const serverless = require('serverless-http');

const app = new ExpressServer(config.URL_PORT, config.OPENAPI_YAML).app;
module.exports.handler = serverless(app);