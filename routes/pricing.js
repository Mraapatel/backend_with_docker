const express = require('express');
const routes = express.Router();


const {addPrice ,getPrice ,updatePrice ,getCountry ,getCity ,getCityPricig} = require('../controllers/pricing-controller')


routes.post('/add', addPrice); // done

routes.get('/fetch', getPrice);

routes.post('/update',updatePrice) //done

routes.post('/fetchCountries',getCountry)

routes.post('/getCity', getCity);

routes.post('/getCityPricig', getCityPricig);

module.exports = routes