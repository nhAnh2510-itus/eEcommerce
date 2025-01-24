const express = require('express');
const morgan = require('morgan');
const {default:helmet} = require('helmet');
const compression = require('compression');
const app = express();

// init middleware
app.use(morgan('dev'));
app.use(helmet());
app.use(compression());


// init db
// init routes
// init error handling
module.exports = app;