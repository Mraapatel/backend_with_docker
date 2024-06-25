const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const path = require('path');
const socket = require('./middlewares/socket-io');

// global.NotificationCount = null;


const app = express();
const server = require('http').Server(app);
socket.initialize(server);
const Port = process.env.PORT || 5000;
const mongodbatlas = process.env.MONGODBATLAS
const { startCron } = require('./utils/cron');
// startCron();
const jwt = require('./routes/jwt_token');
const vehicleType = require('./routes/vehicleType')
const addCounty = require('./routes/addCountry');
const city = require('./routes/city');
const pricing = require('./routes/pricing');
const settingStorage = require('./routes/setting');
const user = require('./routes/user');
const driver = require('./routes/driverList');
const varifyToken = require('./middlewares/varifyToken');
const createRide = require('./routes/createRide');
const confirmRide = require('./routes/confirmRide');
const runningRequest = require('./routes/runningRequest');
const rideHistory = require('./routes/rideHistory');
const test = require('./routes/test');
const allkeys = require('./routes/allKey');

// mongoose.connect('mongodb://127.0.0.1:27017/Product')
mongoose.connect(mongodbatlas)
    .then(() => console.log('connection is successfull...'))
    .catch((error) => console.log(error));


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, 'public')))
// app.use('/icons', express.static('./public'));
// app.use('/userProfile', express.static('./public/userProfile'));
// app.use('/driverProfile', express.static('./public/driverProfile'));
const corsOptions = {
    origin: 'http://localhost:4200',  // URL of your frontend
    optionsSuccessStatus: 200
}
app.use(cors(corsOptions));


app.use('/authenticate', jwt);

app.use(varifyToken);

app.use('/vehicleType', vehicleType);  //done

app.use('/country', addCounty); // done

app.use('/city', city); //done

app.use('/pricing', pricing); // done

app.use('/setting', settingStorage)

app.use('/User', user); // done

app.use('/driver', driver); // done 

app.use('/createRide', createRide); //done

app.use('/confirmRide', confirmRide); // done

app.use('/runningRequest', runningRequest); // done

app.use('/rideHistory', rideHistory); // done

app.use('/test', test);

app.use('/allkeys', allkeys); // done

// app.listen(Port, () => {
//     console.log(`server is listning to port no:${Port}`);
// });
server.listen(Port, () => {
    console.log(`server is listning to port no:${Port}`);
});



