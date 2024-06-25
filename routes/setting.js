const express = require('express');
const routes = express.Router();
// const mongoose = require('mongoose');
// const { Schema } = require('mongoose');

const { getSettings, updateSettings} = require('../controllers/setting-controller');

// const settingSchema = new Schema({
//     TimeOut: {
//         type: Number,
//         required: true
//     },
//     Stops: {
//         type: Number,
//         required: true
//     }
// });

// const Setting = mongoose.model('Setting', settingSchema);


// routes.post('/', async (req, res) => {
//     try {
//         console.log('inside the setting----->', req.body);
//         let action = 'getId'
//         if (req.body._id !== undefined) {

//             let set = await Setting.findByIdAndUpdate({ _id: req.body._id }, { TimeOut: req.body.timeOut, Stops: req.body.stops }, { new: true });
//             return res.status(200).json(set, { message: 'data got successfully' });

//         } else if (req.body.id == action) {

//             console.log(req.body);
//             let setting = await Setting.find({});
//             console.log(setting);

//             if (setting.length < 0) {
//                 return res.status(200).json({ _id: undefined }, { message: 'data fatched successfully' });
//             } else {
//                 return res.status(200).json(setting[0], { message: 'data fatched successfully' });
//             }
//         } else if (req.body._id == undefined) {
//             let setting = {
//                 TimeOut: req.body.timeOut,
//                 Stops: req.body.stops
//             }
//             let set = await Setting.create(setting);
//             return res.status(200).json(set, { message: 'data fatched successfully' });
//         }
//     } catch (e) {
//         console.log(e);
//     }

// });

// routes.get('/', async (req, res) => {
//     try {
//         let settings = await Setting.find();
//         console.log('inside the settings----->', settings[0]);
//         return res.status(200).json(settings[0]);
//     } catch (e) {
//         console.log(e);
//     }
// });

routes.post('/',updateSettings);
routes.get('/',getSettings);


module.exports = routes
// module.exports = { Setting }