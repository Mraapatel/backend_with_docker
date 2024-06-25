
const { Driver } = require('../controllers/driverList-controller');
const mongoose = require('mongoose');
const { createRide } = require('../models/createRide');

const AssignRideToDriver = async (rideId, driverIdToAssign, alreadyAssingedDriver) => {
    try {

        // console.log('AssingeRideToDriver', rideId, driverIdToAssign, alreadyAssingedDriver);
        // return;
        // let c = await Driver.findById(driverIdToAssign)
        // console.log('00000000000000000000000000000000000000000' , c ,'0000000000000000000000000000000000000');
        // if (c.driverStatus !== 0) {
        //     let updatedRide2 = await createRide.findByIdAndUpdate(rideId, { rideStatus: 6 }, { new: true });
        //     let data = {
        //         rideId: updatedRide2._id,
        //         rideStatus: updatedRide2.rideStatus,
        //     }
        //     global.ioInstance.emit('PutRideOnHold-FromCron', data)
        //     return false;
        // }

        let date = new Date()
        let time = date.getTime();
        let ride = await createRide.findByIdAndUpdate(rideId, {
            assignTime: time,
            rideStatus: 1,
            driverId: new mongoose.Types.ObjectId(driverIdToAssign),
            $push: { nearestdriverList: new mongoose.Types.ObjectId(driverIdToAssign) }
        }, { new: true }).lean()

        let updatedDriver = await Driver.findByIdAndUpdate(driverIdToAssign, { driverStatus: 1 }, { new: true })
        if (alreadyAssingedDriver) {
            await Driver.findByIdAndUpdate(alreadyAssingedDriver, { driverStatus: 0 })
        }

        // let fetchedRide = await fetchSingleRide(ride._id);

        // console.log("Ride inside the AssigneRideToDriver", ride);
        return updatedDriver
    } catch (e) {
        console.log('Some Error Occured in AssignRideToDriver ', e);
        return false
    }
}


const removeDriverFormRide = async (rideId) => {
    try {
        console.log('rideId', rideId);

        if (rideId) {
            await createRide.findByIdAndUpdate(rideId, { driverId: null, rideStatus: 0, nearest: false, nearestdriverList: [], assignTime: null });
            // if(driverId){
            //     await Driver.findByIdAndUpdate(driverId, { driverStatus: 0 })
            // }
            return true;
        }
    } catch (e) {
        console.log('Some Error Occured in removeDriverFormRide ', e);

        return false;
    }

}

const updateRideAndDriverModal = async (rideIds, driverIds) => {
    try {
        console.log(
            'rideId', rideIds
        );
        const filter1 = { _id: { $in: rideIds } }

        const update1 = {
            $set: {
                rideStatus: 9,
                driverId: null
            }
        }

        let rideUpdateResult = await createRide.updateMany(filter1, update1);
        console.log(`${rideUpdateResult.modifiedCount} ride documents updated.`)

        const filter2 = { _id: { $in: driverIds } }

        const update2 = {
            $set: {
                driverStatus: 0
            }
        }

        let driverUpdateResult = await Driver.updateMany(filter2, update2);
        console.log(`${driverUpdateResult.modifiedCount} driver documents updated.`)
        return;
    } catch (error) {
        // Handle error
        console.error('Error updating documents in updateRideAndDriverModal', error)
    }

}


const fetchSingleRide = async (rideId) => {
    try {


        let aggregateQuery = [
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(rideId),
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
                $unwind: "$countryInfo"
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
                    localField: "driverId",
                    foreignField: "_id",
                    as: "driverId"
                }
            },
            // {
            //     $unwind: {
            //         path: "$driverId"
            //     }
            // },
            {
                $addFields: {
                    driverId: { $arrayElemAt: ["$driverId", 0] } // Convert driverId array to object
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
                    "typeId.__v": 0,
                    __v: 0
                }
            }
        ]

        let ride = await createRide.aggregate(aggregateQuery)
        if (ride) {
            return ride
        }

        return false

    } catch (e) {
        console.log('Error Occured in commna.js fetchSingleRide', e);
    }
}

async function getCount() {
    return await createRide.countDocuments({ rideStatus: 9 });
}
// const fetchSinglRideInfo = async (rideId)=>{
//     try{
//         if(rideId){
//             let rideInfo = await createRide.aggregate
//         }
//     }catch (e){
//         return null
//     }
// }

module.exports = { AssignRideToDriver, removeDriverFormRide, updateRideAndDriverModal, fetchSingleRide ,getCount}