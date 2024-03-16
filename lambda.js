'use strict';
const awsServerlessExpress = require('aws-serverless-express');
const app = require('./server');
const server = awsServerlessExpress.createServer(app);
exports.handler = (event, context, callback) => {
    event.queryStringParameters = event.multiValueQueryStringParameters;
    awsServerlessExpress.proxy(server, event, context);
};
