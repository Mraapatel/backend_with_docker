
const { createRide } = require('../models/createRide');
const mongoose = require('mongoose');
const { Driver } = require('./driverList-controller');
const { fetchAllRidesByStatus } = require('../utils/fetchAllRidesByStatus');
const { getCount } = require('../utils/comman');

const assignDriverToRide = async (req, res) => {    
    let response = {
        // AssignedRide: {},
        message: 'faild to assign driver'
    }
    try {

        console.log('Inside the runningRequest controller.js ===>', req.body);
        let date = new Date()
        let time = date.getTime();
        await createRide.findByIdAndUpdate(req.body.rideId, { assignTime: time, rideStatus: req.body.rideStatus, driverId: new mongoose.Types.ObjectId(req.body.driverId), nearest: false })
        await Driver.findByIdAndUpdate(req.body.driverId, { driverStatus: 1 });
        console.log('why----->>', await getCount());
        global.ioInstance.emit('updatedCount', await getCount());


        const aggregateQuery = [
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(req.body.rideId)
                }
            },
            {
                $lookup: {
                    from: "vehicletypes",
                    localField: "typeId",
                    foreignField: "_id",
                    as: "typeId"
                }
            },
            {
                $unwind: "$typeId"
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userId"
                }
            },
            {
                $unwind: "$userId"
            },
            {
                $lookup: {
                    from: "countries",
                    localField: "userId.countryCallingCode",
                    foreignField: "_id",
                    as: "countryInfo"
                }
            },
            {
                $unwind: {
                    path: "$countryInfo"
                }
            },
            {
                $project: {
                    "countryInfo.flagSymbol": 0,
                    "countryInfo.countryCode2": 0,
                    "countryInfo.countryCode": 0,
                    "countryInfo.timeZone": 0,
                    "countryInfo.__v": 0
                }
            },
            {
                $lookup: {
                    from: "driverlists",
                    localField: "countryInfo._id",
                    foreignField: "countryId",
                    as: "driverId"
                }
            },
            {
                $unwind: {
                    path: "$driverId"
                }
            },
            {
                $match: {
                    'driverId._id': new mongoose.Types.ObjectId(req.body.driverId)
                }
            },
            {
                $project: {
                    "driverId.countryId": 0,
                    "driverId.cityId": 0,
                    "driverId.serviceType": 0,
                    "driverId.__v": 0,
                    "userId.countryCallingCode": 0,
                    "userId.__v": 0,
                    'typeId.__v': 0,
                    __v: 0,
                }
            }
        ]

        // aggregateQuery.unshift(...query)

        const assignedRideWithDriver = await createRide.aggregate(aggregateQuery)


        if (assignedRideWithDriver) {
            response.message = 'Ride Assigned Successfully';
            console.log('assignedRideWithDriver', assignedRideWithDriver);
            global.ioInstance.emit('assignedRideWithDriver', assignedRideWithDriver[0]);
            return res.status(200).json(response);
        }

        return res.status(404).json(response);

        // return assignedRideWithDriver[0]
    } catch (e) {
        response.message = 'Some Error Occured while assigning driver'
        console.log('Error Occured while assigning driver', e);
        return res.status(400).json(response);
    }
}


const allRunnigRequest = async (req, res) => {
    let response = {
        message: 'No Running Requests found',
        Requests: []
    }
    try {
        console.log('inside the running request  allrunningrequest', req.body);
        // const aggregateQuery = [
        //     {
        //         $match: {
        //             // rideStatus: 0
        //              rideStatus: req.body.status
        //         }
        //     },
        //     {
        //         $lookup: {
        //             from: "vehicletypes",
        //             localField: "typeId",
        //             foreignField: "_id",
        //             as: "typeId"
        //         }
        //     },
        //     {
        //         $unwind: "$typeId"
        //     },
        //     {
        //         $lookup: {
        //             from: "users",
        //             localField: "userId",
        //             foreignField: "_id",
        //             as: "userId"
        //         }
        //     },
        //     {
        //         $unwind: "$userId"
        //     },
        //     {
        //         $lookup: {
        //             from: "countries",
        //             localField: "userId.countryCallingCode",
        //             foreignField: "_id",
        //             as: "countryInfo"
        //         }
        //     },
        //     {
        //         $unwind: "$countryInfo"
        //     },
        //     {
        //         $project: {
        //             "countryInfo.flagSymbol": 0,
        //             "countryInfo.countryCode2": 0,
        //             "countryInfo.countryCode": 0,
        //             "countryInfo.timeZone": 0,
        //             "countryInfo.__v": 0
        //         }
        //     },
        //     {
        //         $lookup: {
        //             from: "driverlists",
        //             localField: "driverId",
        //             foreignField: "_id",
        //             as: "driverId"
        //         }
        //     },

        //     {
        //         $unwind: {
        //             path: "$driverId"
        //         }
        //     },
        //     {
        //         $project: {
        //             "driverId.countryId": 0,
        //             "driverId.cityId": 0,
        //             "driverId.serviceType": 0,
        //             "driverId.__v": 0,
        //             "userId.countryCallingCode": 0,
        //             "userId.__v": 0,
        //             "typeId.__v": 0,
        //             __v: 0
        //         }
        //     }
        // ]

        // const assignedRidesWithDrivers = await createRide.aggregate(aggregateQuery)
        const assignedRidesWithDrivers = await fetchAllRidesByStatus(req.body.status)

        if (assignedRidesWithDrivers) {
            response.message = 'Found the Rides';
            response.Requests = assignedRidesWithDrivers;
            console.log('inside the runningRequest-controller- allRunningRequest--------->', assignedRidesWithDrivers);
            return res.status(200).json(response);
        }

        console.log('inside the runningRequest-controller--------->', assignedRidesWithDrivers);
        return res.status(200).json(response);

        // return assignedRidesWithDrivers

    } catch (e) {
        response.message = 'Some Error Occured while fetching the running Requests'
        console.log('Error Occured while fetching the running Requests', e);
        return res.status(400).json(response);
    }



}


const driverAccecptedRide = async (req, res) => {
    let response = {
        Ride: {},
        message: "Faild to Assign Ride"
    }
    try {

        const accecptedRide = await createRide.findByIdAndUpdate(req.body.rideId, { rideStatus: 5 }, { new: true });
        await Driver.findByIdAndUpdate(req.body.driverId, { driverStatus: 5 })
        console.log('inside the runningRequest-controller--------->', accecptedRide);



        if (accecptedRide) {
            response.Ride = accecptedRide
            response.message = 'Driver Assigned Successfully'
            global.ioInstance.emit('acceptedRideWithDriver', accecptedRide);
            return res.status(200).json(response)
        }

        return res.status(200).json(response)

    } catch (e) {
        response.message = 'Some Error Occured while Assigning ride to driver'
        console.log('Error Occured while Assigning ride to driver', e);
        return res.status(400).json(response);
    }
    // return accecptedRide

}

const driverRejectedRide = async (req, res) => {
    let response = {
        Ride: {},
        message: "Faild to Reject Ride"
    }
 
    try {
        let status
        if (req.body.nearest) {
            status = 1
        } else {
            status = 9
        }
        console.log('inside the runningRequest - driverRejectedRide', req.body);
        const rejectedRide = await createRide.findByIdAndUpdate(req.body.rideId, { rideStatus: status, driverId: null, assignTime: null }, { new: true })
        await Driver.findByIdAndUpdate(req.body.driverId, { driverStatus: 0 });
        global.ioInstance.emit('updatedCount', await getCount());


        if (rejectedRide) {
            response.Ride = rejectedRide
            response.message = 'Request rejected Successfully'
            global.ioInstance.emit('rejectedRideByDriver', rejectedRide);
            return res.status(200).json(response)
        }

        console.log('inside the runningRequest-controller--------->', rejectedRide);
        return res.status(200).json(response)

    } catch (e) {
        response.message = 'Some Error Occured while Rejecting Ride'
        console.log('Error Occured while Rejecting Ride', e);
        return res.status(400).json(response);
    }
    // return accecptedRide

}

module.exports = { assignDriverToRide, allRunnigRequest, driverAccecptedRide, driverRejectedRide }