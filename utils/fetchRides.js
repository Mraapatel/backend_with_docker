const { createRide } = require('../models/createRide');
const mongoose = require('mongoose');

const getRidesFormDb = async (pages, rideLimit, searchTerm, vehicleType, date, rideStatus) => {

    try {
        console.log('inside getRides---------------');
        const page = pages || 1; // Parse the page number from the query parameter, defaulting to 1 if it's not present
        const limit = rideLimit; // Set the number of documents to return per page

        let totalRides // Get the total number of documents in the collection

        let Rides;
        let query = {}

        if (rideStatus) {
            query = {
                rideStatus: { $in: [rideStatus] }
            };
        } else if (rideStatus === 0) {
            query = {
                rideStatus: 0 // Always exclude rideStatus 7 and 8
            };
        } else {
            query = {
                rideStatus: { $nin: [7, 8] } // Always exclude rideStatus 7 and 8
            };
        }

        if (vehicleType) {
            query['typeId._id'] = new mongoose.Types.ObjectId(vehicleType);
        }
        console.log('date======>', date);
        if (date) {
            query.date = date;
        }

        let searchConditions = [];
        if (searchTerm) {
            console.log('nan', parseInt(searchTerm));
            if (!isNaN(parseInt(searchTerm))) {
                searchConditions.push({ Ride_index: { $eq: parseInt(searchTerm) } });
            }

            searchConditions.push(
                { 'userId.userName': { $regex: new RegExp(searchTerm, 'i') } },
                { 'userId.userEmail': { $regex: new RegExp(searchTerm, 'i') } },
                { 'userId.userPhone': { $regex: new RegExp(searchTerm, 'i') } },
                { 'countryInfo.country': { $regex: new RegExp(searchTerm, 'i') } },
                //  { startLocation: { $regex: new RegExp(searchTerm, 'i') } }, 
                //  { endLocation: { $regex: new RegExp(searchTerm, 'i') } }, 
                { paymentMethod: { $regex: new RegExp(searchTerm, 'i') } },
                { 'countryInfo.currency': { $regex: new RegExp(searchTerm, 'i') } },
                { 'countryInfo.countryCode': { $regex: new RegExp(searchTerm, 'i') } },
            );
        }

        if (searchConditions.length > 0) {
            if (!query.$or) {
                query.$or = [];
            }
            query.$or = query.$or.concat(searchConditions);
        }

        console.log('query------>', query);
        // console.log('searchConditions------>', searchConditions);


        const aggregateQuery = [
            // {
            //     $match: {
            //         rideStatus: {
            //             $nin: [7, 8]
            //         }
            //     }
            // },
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
                $project: {
                    __v: 0,
                    'countryInfo.countryCode2': 0,
                    'countryInfo.flagSymbol': 0,
                    'countryInfo.timeZone': 0,
                    // 'countryInfo.countryCode': 0,
                    'countryInfo.__v': 0,
                    "userId.countryCallingCode": 0,
                    "userId.__v": 0,
                    'typeId.__v': 0
                    // 'countryInfo._id': 0,
                }
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
            { $match: query },
            { $skip: (page - 1) * limit },
            // { $limit: limit },
        ];


        if (searchConditions.length > 0) {
            aggregateQuery.push({ $match: { $or: searchConditions } });
        }

        Rides = await createRide.aggregate(aggregateQuery).collation({ locale: 'en', strength: 2 });
        console.log('Rides.length,', Rides.length);

        ////////////////////////////  pagination logic ///////////////////////////////
        if (vehicleType) {

            aggregateQuery.push({
                $count: "totalRides"
            });

            console.log('countQuery ====>', aggregateQuery);

            //   Execute the aggregation query to count documents
            const countResult = await createRide.aggregate(aggregateQuery).collation({ locale: 'en', strength: 2 });

            //   Extract the total number of rides from the count result
            totalRides = countResult.length > 0 ? countResult[0].totalRides : 0;
        } else {

            if (searchTerm) {
                // totalRides = await createRide.countDocuments(query);
                totalRides = await createRide.countDocuments({ $and: [query, { $or: searchConditions }] });
                // totalRides = await createRide.countDocuments(query);
            } else {
                console.log('query inside else', query);
                totalRides = await createRide.countDocuments(query);
            }
        }



        console.log('totalRides', totalRides);

        return { totalRides: totalRides, Rides: Rides };
    } catch (e) {
        console.log('Error fetching Rides:', e);
        return { error: 'Failed to fetch Rides' };
    }


}

module.exports = { getRidesFormDb }