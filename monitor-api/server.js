"use strict";
const express = require('express');

const config = require('./config');
const initializeApi = require('./api');

const app = express();

initializeApi(app);

app.listen(config.port, _ => {
    console.log(`Monitor API express server started on port ${config.port}...`);
});




