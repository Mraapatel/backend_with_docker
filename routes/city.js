const express = require('express');
// const multer = require('multer')
const routes = express.Router();
// const path = require('path')


const {addZone , getCountries , saveChangedZone} = require('../controllers/city-controller')


routes.post('/addZone', addZone);

routes.post('/cities', getCountries);

routes.post('/saveChangedZone', saveChangedZone);

module.exports = routes