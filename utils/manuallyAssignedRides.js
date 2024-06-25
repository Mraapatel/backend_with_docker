const { createRide } = require('../models/createRide');
// const mongoose = require('mongoose');


const assignedRides = async () => {
    try {

        let time = new Date().getTime()

        const aggregatePipe = [
            {
                $match: {
                    rideStatus: 1,
                    nearest: false
                }
            },
            {
                $lookup: {
                    from: "settings",
                    pipeline: [],
                    as: "settings"
                }
            },
            {
                $unwind: "$settings"
            },
            {
                $match: {
                    $expr: {
                        $gt: [
                            {
                                $subtract: [
                                    time,
                                    "$assignTime"
                                ]
                            },
                            {
                                $multiply: [
                                    {
                                        $ifNull: [
                                            "$settings.TimeOut",
                                            20
                                        ]
                                    },
                                    1000
                                ]
                            }
                        ]

                    }
                }
            },
            {
                $group: {
                    _id: null,
                    _ids: { $push: "$_id" },
                    driverIds: { $push: "$driverId" }
                }
            },
            {
                $project: {
                    _id: 0,
                    _ids: 1,
                    driverIds: 1
                }
            }

        ]


        let data = await createRide.aggregate(aggregatePipe)
        // console.log('data', data);

        return data
    } catch (e) {
        return false
    }
}

module.exports = { assignedRides }