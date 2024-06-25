const express = require('express');
const routes = express.Router();

const {token} = require('../controllers/jwt_token-controller');

routes.route('/').post(token);

module.exports = routes