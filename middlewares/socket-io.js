const { Server } = require('socket.io');
const { getDrivers } = require('../controllers/confirmRide-controller');
const { runnigRequest, allRunnigRequest, driverAccecptedRide } = require('../controllers/runningRequest-controller');
const { createRide } = require('../models/createRide');
const { getCount } = require('../utils/comman')



global.ioInstance = null


// async function getCount() {
//     return await createRide.countDocuments({ rideStatus: 9 });
// }

async function initialize(server) {
    global.ioInstance = new Server(server, {
        cors: {
            origin: ['http://localhost:4200'],
            METHODS: ['GET', 'POSt'],
            credentials: true,
        }
    })

    global.ioInstance.on('connection', (socket) => {
        console.log('new connection-------->>>>>>>>>>>> ', socket.id);
        socket.on('formClient', (data) => {
            console.log('formClient event', data);
        })

        socket.on('updateCount', async (data) => {
            console.log('updateCount event catched in first', data);
            global.NotificationCount++
            console.log('using the getCount------->>>', await getCount());
            // console.log('socket object',socket);
            // global.ioInstance.emit('updatedCount', global.NotificationCount);
            global.ioInstance.emit('updatedCount', await getCount());

        })

        socket.on('updateCountDes', async (data) => {
            console.log('updateCountDes event catched', data);
            global.NotificationCount--
            console.log('global iin des ', global.NotificationCount);
            // console.log('socket object',socket);
            global.ioInstance.emit('updatedCount', await getCount());
            // global.ioInstance.emit('updatedCount', global.NotificationCount);
        })

        socket.on('getCount', async (data) => {
            console.log('getCount event catched', data);
            // global.NotificationCount--
            console.log('using the getCount------->>>', await getCount());
            // console.log('socket object',socket);
            // global.ioInstance.emit('updatedCount', global.NotificationCount);
            global.ioInstance.emit('updatedCount', await getCount());
        })

        // db.collection.aggregate([
        //     { $group: { _id: null, maxIndex: { $max: "$index" } } }
        //   ])

        // db.collection.updateOne(
        //     { _id: newDocumentId },
        //     { $set: { index: { $add: ["$maxIndex", 1] } } }
        //   )

        // socket.on('getActiveDriversForAssign', async (data) => {
        //     console.log('getDataForAssign', data);
        //     let Drivers = await getDrivers(data.cityId, data.typeId);
        //     if (Drivers) {
        //         socket.emit('ActiveDrivers', Drivers);
        //     }
        // })

        // socket.on('assignDriverToRide', async (data) => {
        //     console.log('assignDriverToRide', data);
        //     let assignedRideWithDriver = await runnigRequest(data.rideId, data.driverId, data.rideStatus);
        //     global.ioInstance.emit('assignedRideWithDriver', assignedRideWithDriver);
        // })

        // socket.on('getTheRunningRequests', async (data) => {
        //     let assignedRidesWithDrivers = await allRunnigRequest(data.rideStatus);
        //     socket.emit('allAssignedRidesWithDrivers', assignedRidesWithDrivers);
        // })

        // socket.on("driverAccecptedRideRequest", async (data) => {
        //     let accecptedRide = driverAccecptedRide(data.rideId);
        //     global.ioInstance.emit('acceptedRideWithDriver', accecptedRide)
        // })
    })

}


module.exports = { initialize, getCount };