'use strict';
const path = require('path');
const express = require('express');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const settings = require('./config/settings');


// MongoDB setup
mongoose.Promise = global.Promise;
mongoose.connect( settings.mongodb.url, {useMongoClient: true})
.then( function () {
    console.info('Connected to MongoDB');
})
.catch( function (err) {
    console.error(err.message);
    process.exit(1);
});


// Express server setup
let app = express();
app.use( logger( settings.service.log.format, {immediate: settings.service.log.immediate} ));
app.use( bodyParser.json());
app.use( bodyParser.urlencoded({ extended: false }));
app.use( cookieParser());


// API handlers
// TODO
app.use('/employee', require('./routes/employee'));
app.use('/workday', require('./routes/workday'));


// Catch 404 and forward to error handler
app.use( function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Error handler
app.use( function (err, req, res, next) {
    let o = {
        status: err.status,
        error: err.message,
    };
    if (settings.debug)
        o.stack = err.stack;

    res.status( err.status || 500).send(o);
});

// Start listening server
app.listen( settings.service.port, function () {
    console.info(`Listening on port ${settings.service.port}`);
});
