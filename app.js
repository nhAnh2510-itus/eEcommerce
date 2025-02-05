const express = require('express');
const morgan = require('morgan');
const {default:helmet} = require('helmet');
const compression = require('compression');


const app = express();

// init middleware
app.use(morgan('dev'));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({extended:true}));



// init db
require('./dbs/db.js');
const {checkoverload} =require('./helps/checkconnect.js');
// checkoverload();
// init routes

app.use('/',require('./routes'));
// init error handling
module.exports = app;