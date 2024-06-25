const { Driver } = require('../controllers/driverList-controller');
const mongoose = require('mongoose');



const fetchIdleDrivers = async (cityId, typeId, status = 0) => {
    // console.log('idledriver method called ');
    // console.log('cityid',cityId);
    // console.log('typeId',typeId);

    let fetchedDrivers = await Driver.aggregate(
        [
            {
                $match: {
                    cityId: new mongoose.Types.ObjectId(cityId),
                    serviceType: new mongoose.Types.ObjectId(typeId),
                    approveStatus: true,
                    driverStatus: status
                }
            },
            {
                $lookup: {
                    from: 'cityzones',
                    localField: 'cityId',
                    foreignField: '_id',
                    as: 'cityId'
                }
            },
            {
                $unwind: {
                    path: '$cityId',
                }
            },
            {
                $lookup: {
                    from: 'countries',
                    localField: 'countryId',
                    foreignField: '_id',
                    as: 'countryId'
                }
            },
            {
                $unwind: {
                    path: '$countryId',
                }
            },
            {
                $project: {
                    __v: 0,
                    'cityId.place_id': 0,
                    'cityId.coordinates': 0,
                    'cityId.__v': 0,
                    'cityId.countryId': 0,
                    'countryId.flagSymbol': 0,
                    'countryId.countryCode2': 0,
                    'countryId.countryCode': 0,
                    'countryId.timeZone': 0,
                    'countryId.__v': 0,
                }
            }
        ]
    )

    // console.log('fetchedDrivers----->',fetchedDrivers);

    return fetchedDrivers
}

module.exports = { fetchIdleDrivers }