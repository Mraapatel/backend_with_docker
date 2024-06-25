const express = require('express');
let routes = express.Router();

const { storeRide  , getRides ,getVehicleTypes ,checkForStartingPoint} = require('../controllers/createRide-controller')

routes.post('/storeRide', storeRide);

routes.post('/getRides', getRides);

routes.post('/getVehicleTypes', getVehicleTypes);

routes.post('/checkForStartingPoint', checkForStartingPoint);


module.exports = routes