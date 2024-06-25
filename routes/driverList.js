const express = require('express');
const multer = require('multer')
const routes = express.Router();
const path = require('path')

const { getCities } = require('../controllers/city-controller');
const { addDriver, getDrivers, updateDriver, deleteDriver, addService, approveDriver, storeBankDetails } = require('../controllers/driverList-controller');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../public/driverProfile')
    cb(null, uploadPath); // Destination directory for uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`); // Use the original filename
  }
});

const upload = multer({ storage: storage })

routes.post('/addDriver', upload.single('driverProfile'), addDriver); //done

routes.post('/addService', addService); // done

routes.post('/getCities', getCities); // done

routes.post('/storeBankDetails', storeBankDetails); // done

routes.post('/getDrivers', getDrivers); //done

routes.post('/updateDriver', upload.single('driverProfile'), updateDriver); // done

routes.post('/deleteDriver', deleteDriver); // done

routes.post('/approve', approveDriver); //done

module.exports = routes