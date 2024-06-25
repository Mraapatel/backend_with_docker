const express = require('express');
let routes = express.Router();

const { getRides , storeFeedback} = require('../controllers/rideHistory-controller')

routes.post('/getRidesInHistory', getRides);

routes.post('/storeFeedback', storeFeedback);

module.exports = routes