const mongoose = require('mongoose');
const { createRide } = require('../models/createRide');


const getRides = async (req, res) => {
    let response = {
        message: 'Some Error Occured in While fetching the rides',
        rides: []
    }
    try {
        // let date = req.body.date;
        let fromdate = req.body.fromdate;
        let todate = req.body.todate;
        let vehicleType = req.body.vechicleType
        let searchTerm = req.body.searchTerm;
        let rideStatus = req.body.rideStatus;
        console.log('inside the ridehistory  - getride--->', req.body);

        let query = {}

        if (rideStatus) {
            query = {
                rideStatus: { $in: [rideStatus] } // Always exclude rideStatus 7 and 8
            };
        }
        else {
            console.log('insdie there');
            query = {
                rideStatus: { $in: [7, 8] } // Always exclude rideStatus 7 and 8
            };
        }



        if (vehicleType) {
            query['typeId._id'] = new mongoose.Types.ObjectId(vehicleType);
        }
        // console.log('date======>', date);
        // if (date) {
        //     query.date = date;
        // }
        if (fromdate && todate) {
            query.date = {
                $gte: fromdate,
                $lte: todate
            };
        } else if (fromdate) {
            query.date = { $gte: new Date(fromdate) };
        } else if (todate) {
            query.date = { $lte: new Date(todate) };
        }

        let searchConditions = [];



        if (searchTerm) {
            if (!isNaN(parseInt(searchTerm))) {
                searchConditions.push({ Ride_index: { $eq: parseInt(searchTerm) } });
            }

            searchConditions.push(
                { 'userId.userName': { $regex: new RegExp(searchTerm, 'i') } },
                { 'userId.userEmail': { $regex: new RegExp(searchTerm, 'i') } },
                { 'userId.userPhone': { $regex: new RegExp(searchTerm, 'i') } },
                { 'driverId.driverPhone': { $regex: new RegExp(searchTerm, 'i') } },
                { 'driverId.driverEmail': { $regex: new RegExp(searchTerm, 'i') } },
                { 'driverId.driverName': { $regex: new RegExp(searchTerm, 'i') } },
                { 'countryInfo.country': { $regex: new RegExp(searchTerm, 'i') } },
                { 'countryInfo.currency': { $regex: new RegExp(searchTerm, 'i') } },
                { 'countryInfo.countryCode': { $regex: new RegExp(searchTerm, 'i') } },
                { date: { $regex: new RegExp(searchTerm, 'i') } },
                { startLocation: { $regex: new RegExp(searchTerm, 'i') } }, // Example for another field
                { endLocation: { $regex: new RegExp(searchTerm, 'i') } }, // Example for another field
                { paymentMethod: { $regex: new RegExp(searchTerm, 'i') } }, // Example for another field
            );
        }

        if (searchConditions.length > 0) {
            if (!query.$or) {
                query.$or = [];
            }
            query.$or = query.$or.concat(searchConditions);
        }
        console.log('query ===>', query);
        const aggregateQuery = [
            {
                $match: {
                    rideStatus: {
                        $in: [7, 8]
                    }
                }
            },
            {
                $lookup: {
                    from: 'vehicletypes',
                    localField: 'typeId',
                    foreignField: '_id',
                    as: 'typeId'
                }
            },
            {
                $unwind: '$typeId'
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'userId'
                }
            },
            {
                $unwind: '$userId'
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
                $unwind: '$countryInfo',

            },
            {
                $lookup: {
                    from: "driverlists",
                    localField: "driverId",
                    foreignField: "_id",
                    as: "driverId"
                }
            },
            {
                $addFields: {
                    driverId: { $arrayElemAt: ["$driverId", 0] } // Convert driverId array to object
                }
            },
            {
                $project: {
                    __v: 0,
                    time: 0,
                    assignTime: 0,
                    nearestdriverList: 0,
                    'countryInfo.countryCode2': 0,
                    'countryInfo.flagSymbol': 0,
                    'countryInfo.timeZone': 0,
                    'countryInfo.__v': 0,
                    'countryInfo._id': 0,
                    "userId.countryCallingCode": 0,
                    "userId.stripCustomerId": 0,
                    "userId._id": 0,
                    "driverId._id": 0,
                    "driverId.cityId": 0,
                    "driverId.countryId": 0,
                    "driverId.driverStatus": 0,
                    "driverId.approveStatus": 0,
                    "driverId.bankDetailsAdded": 0,
                    "driverId.driverStripCustomerId": 0,
                    "driverId.serviceType": 0,
                    "driverId.__v": 0,
                    "userId.__v": 0,
                    'typeId.__v': 0,
                    'typeId.vehicleIcon': 0,
                    'cityId': 0,
                }
            },
            { $match: query },

            // { $skip: (page - 1) * limit },
            // { $limit: limit },
        ];
        // console.log('AggregateQuery------->',aggregateQuery);

        let rides = await createRide.aggregate(aggregateQuery)
        // console.log('rides fetched', rides);

        if (rides.length > 0) {
            response.rides = rides;
            response.message = 'Rides Fetched Successfully';
            return res.status(200).json(response)
        }

        response.message = 'Currently No rides are available'
        return res.status(404).json(response)


    } catch (e) {
        console.log('Some Erorr Occured in ridehistory controller -getRides', e);
        return res.status(500).json(response)
    }
}

const storeFeedback = async (req, res) => {
    let response = {
        message: 'Some Error Occured in While storing the feedback',
        status: 500
    }
    try {

        console.log('inside the stroefeedback --->', req.body);
        let ride = await createRide.findByIdAndUpdate(req.body.id, { feedback: { rating: req.body.rating, message: req.body.message } }, { new: true })
        console.log('storedfeedbackRide-->', ride);

        if (ride) {
            response.message = 'feedback stored Successfully';
            response.status = 200;
            return res.status(200).json(response)
        }

        response.message = 'No such Rides Found';
        response.status = 404;
        return res.status(404).json(response)


    } catch (e) {
        console.log('Some Erorr Occured in storefeedback', e);
        return res.status(500).json(response)
    }
}
module.exports = { getRides, storeFeedback }