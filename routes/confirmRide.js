const express = require('express');
let routes = express.Router();

const { getRides, getVehicleTypes, getDrivers, assignNearestDriver, cancleRide, rideStarted, rideArrived ,rideCompleted ,ridePicked } = require('../controllers/confirmRide-controller');

routes.post('/getRides', getRides);

routes.post('/getVehicleTypes', getVehicleTypes);

routes.post('/getDriverForAssignRide', getDrivers);

routes.post('/assignNearestDriver', assignNearestDriver);

routes.post('/cancleRide', cancleRide);

routes.post('/rideStarted', rideStarted);

routes.post('/rideArrived', rideArrived);

routes.post('/ridePicked', ridePicked);

routes.post('/rideCompleted', rideCompleted);



module.exports = routes