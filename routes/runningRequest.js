const express = require('express');
let routes = express.Router();

const { assignDriverToRide ,allRunnigRequest ,driverAccecptedRide ,driverRejectedRide} = require('../controllers/runningRequest-controller');

routes.post('/getAllRunningRides', allRunnigRequest);

routes.post('/assingDriverToRide', assignDriverToRide);

routes.post('/driverAcceptedRide', driverAccecptedRide);

routes.post('/driverRejectedRide', driverRejectedRide);




module.exports = routes