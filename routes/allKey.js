const express = require('express');
// const multer = require('multer')
const routes = express.Router();
// const path = require('path')


const {saveData ,getKeys} = require('../controllers/allKey-controller');


routes.post('/update', saveData);

routes.post('/getKeys', getKeys);

// routes.post('/Twilio', saveChangedZone);

module.exports = routes