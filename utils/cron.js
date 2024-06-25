const cron = require('node-cron');
const { fetchAllRidesByStatus } = require('./fetchAllRidesByStatus');
// const { fetchIdleDrivers } = require('./fetchIdleDrivers');
// const { getSettings } = require('../utils/getSettings');
// const { default: mongoose } = require('mongoose');
const { updateRideAndDriverModal } = require('./comman');
const { assignedRides } = require('./manuallyAssignedRides');
const { Driver } = require('../controllers/driverList-controller');
const { createRide } = require('../models/createRide');



let IdleRides = [];

const startCron = cron.schedule('*/1 * * * * *', async () => {

    // console.log('cron Ran');
    await checkForManual();
    await assignNewDriverToRide();

}, {
    scheduled: false
})

startCron.start()


const assignNewDriverToRide = async () => {
    IdleRides = await fetchAllRidesByStatus(1, true);
    // console.log('idlerides by nearby', IdleRides);


    // console.log('-------------------------------------------------------');
    if (IdleRides.length > 0) {
        for (let i = 0; i < IdleRides.length; i++) {
            const ride = IdleRides[i];
            console.log('****************************************', ride.endLocation, '********************************************************************************************************');
            // console.log('HERRRRRRRRRRRRRRRR', i);
            // console.log('dirverId', ride.driverId);
            if (ride.driverId !== null) {
                let removedDriver = await Driver.findByIdAndUpdate(ride.driverId, { driverStatus: 0 }, { new: true })
                console.log('removedDriver', removedDriver);
            }
            console.log('eeeeeeeeeeeeeeeeeeeeeeee');
            // console.log('ddddddddddddd----------in', ride.notAssigndDrivers);
            if (ride.notAssigndDrivers && ride.notAssigndDrivers.length > 0) {
                // console.log('broooooo', ride.notAssigndDrivers[0]);
                // console.log('ddddddddddddd ---------out', ride);

                let c = await Driver.findById(ride.notAssigndDrivers[0])
                console.log('cccccccccccc', c);
                // console.log('dddddddddddd', ride.notAssigndDrivers[0]);


                if (c && c.driverStatus == 0) {
                    try {

                        // console.log('ride.id', ride._id);
                        // console.log('ride.notAssigndDrivers[0]', ride.notAssigndDrivers[0]);

                        let date = new Date()
                        let time = date.getTime();
                        let rideUpdated = await createRide.findByIdAndUpdate(ride._id, {
                            assignTime: time,
                            rideStatus: 1,
                            driverId: ride.notAssigndDrivers[0],
                            $push: { nearestdriverList: ride.notAssigndDrivers[0] }
                        }, { new: true }).lean()
                        // console.log('after updateing the ride info');

                        // console.log('inside the c.driverStatus == 0');
                        let updatedDriver = await Driver.findByIdAndUpdate(ride.notAssigndDrivers[0], { driverStatus: 1 }, { new: true })


                        let updatedRide = ride
                        updatedRide.driverId = updatedDriver
                        updatedRide.rideStatus = rideUpdated.rideStatus

                        console.log('final updated Ride with driver', updatedRide);

                        global.ioInstance.emit('updateListFromCron', updatedRide)
                        console.log('updateListFromCron event inside the if 1" if ');
                    } catch (e) {
                        console.log('Error', e);
                    }
                }
                if (c.driverStatus == 1) {
                    console.log('inside the c.driverStatus == 1');

                    let isremainingDriver = await Driver.findOne({
                        driverStatus: 1,
                        approveStatus: true,
                        serviceType: ride.typeId._id,
                        cityId: ride.cityId,
                        _id: { $nin: ride.nearestdriverList }
                    })

                    if (isremainingDriver) {
                        let updatedRide2 = await createRide.findByIdAndUpdate(ride._id, { rideStatus: 6, driverId: null, assignTime: null }, { new: true });
                        let data = {
                            rideId: updatedRide2._id,
                            rideStatus: updatedRide2.rideStatus
                        }
                        console.log('data', data);
                        global.ioInstance.emit('PutRideOnHold-FromCron', data)
                        console.log('PutRideOnHold-FromCron event inside the if 2" if ', ride.endLocation);

                        console.log('updatedRide2', updatedRide2);
                    } else {
                        let updatedRide5 = await createRide.findByIdAndUpdate(ride._id, { driverId: null, rideStatus: 0, nearest: false, nearestdriverList: [], assignTime: null }, { new: true });
                        let data = {
                            rideId: updatedRide5._id,
                            rideStatus: updatedRide5.rideStatus
                        }
                        global.ioInstance.emit('NoDriverRemaining-ByCron', data)
                        console.log('NoDriverRemaining-ByCron event inside the if 2" -else ');

                    }

                }

            }
            else {

                console.log('ride inside the else condtion ');
                console.log('===============================', ride.driverId, '============================');

                console.log('nearesdrivelist', ride.nearestdriverList);

                let remainingDriver = await Driver.findOne({
                    driverStatus: { $in: [0, 1] },
                    approveStatus: true,
                    serviceType: ride.typeId._id,
                    cityId: ride.cityId,
                    _id: { $nin: ride.nearestdriverList }
                })

                // if (ride._id == '6649e23cb887aef24ed4ed90') {

                //     let d = await Driver.findById(new mongoose.Types.ObjectId('6645d6cd6338fc54614de0ff'))
                //     console.log('dddddddddddd', d);
                // }
                console.log('remaining driver ------------>', remainingDriver);

                if (remainingDriver) {

                    let updatedRide3 = await createRide.findByIdAndUpdate(ride._id, { rideStatus: 6, driverId: null, assignTime: null }, { new: true });
                    let data = {
                        rideId: updatedRide3._id,
                        rideStatus: updatedRide3.rideStatus
                    }
                    global.ioInstance.emit('PutRideOnHold-FromCron', data)
                    console.log('PutRideOnHold-FromCron event inside the else - if ', ride.endLocation);

                } else {

                    // if (ride.driverId) {
                    // removeDriverFormRide(ride._id);
                    let updatedRide4 = await createRide.findByIdAndUpdate(ride._id, { driverId: null, rideStatus: 9, nearest: false, nearestdriverList: [], assignTime: null }, { new: true });
                    let data = {
                        rideId: updatedRide4._id,
                        rideStatus: updatedRide4.rideStatus
                    }
                    console.log('updatedRide4=========>', updatedRide4);
                    global.ioInstance.emit('NoDriverRemaining-ByCron', data)
                    console.log('NoDriverRemaining-ByCron event inside the else 2" -else ');
                    // }
                }
            }

        }
    }

}


const checkForManual = async () => {
    // console.log('workd');
    let driverIds = []
    let rideIds = [];
    let getRidesInfo = await assignedRides();
    // console.log('lendth', getRidesInfo.length);
    if (getRidesInfo.length > 0) {
        console.log('workd2');
        console.log('getRidesInfo', getRidesInfo);
        rideIds = getRidesInfo[0]._ids
        driverIds = getRidesInfo[0].driverIds
        // console.log('getRidesInfo', getRidesInfo);
        // console.log('rideid inside cron', rideIds);
        await updateRideAndDriverModal(rideIds, driverIds)
        global.ioInstance.emit('TimesUpForAssigndRides', rideIds)

    }
}




module.exports = { startCron }