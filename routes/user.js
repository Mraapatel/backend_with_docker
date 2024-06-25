const express = require('express');
const multer = require('multer')
const routes = express.Router();
const path = require('path')

const { addUser, getUser, updateUser, deleteUser, addCard, getCards, setDefaultCard, deleteCard, getSinglUser } = require('../controllers/user-controller');
// const { log } = require('console');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../public/userProfile')
    cb(null, uploadPath); // Destination directory for uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`); // Use the original filename
  }
});

const upload = multer({ storage: storage })


routes.post('/addUser', upload.single('userProfile'), addUser); // done

routes.post('/addCard', addCard); // done

routes.post('/getCards', getCards); //done

routes.post('/setDefaultCard', setDefaultCard);  //done

routes.post('/deleteCard', deleteCard); //done

routes.post('/getUser', getUser); //done


routes.post('/updateUser', upload.single('userProfile'), updateUser); // done

routes.post('/deleteUser', deleteUser); // done

routes.post('/getSinglUser', getSinglUser);

module.exports = routes