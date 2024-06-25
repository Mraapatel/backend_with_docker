const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const fs = require('fs');
const path = require('path');
const { fetchKeys } = require('../utils/fetchKeys');

let stripe = null;

const initializeStripe = async () => {
    try {
        let publickey = await fetchKeys('stripe');
        stripe = require('stripe')(publickey);

    } catch (e) {
        console.log('error in initializeStripe', e);
    }

}

const driverSchema = new Schema({
    driverName: {
        type: String,
        required: true
    },
    driverProfile: {
        type: String,
        required: true,
    },
    driverEmail: {
        type: String,
        required: true,
        unique: true,
    },
    driverStripCustomerId: {
        type: String,
        // required: true,
        unique: true,
    },
    countryId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    cityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'cityZone',
        required: true,
    },
    driverPhone: {
        type: String,
        required: true,
        // unique: true,
    },
    serviceType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'vehicleType',
        default: null,
    },
    approveStatus: {
        type: Boolean,
        required: true
    },
    driverStatus: {
        type: Number,
        default: 0
    },
    bankDetailsAdded: {
        type: Boolean,
        default: false
    }
});

const Driver = mongoose.model('DriverList', driverSchema);

// const addDriver = async (req, res) => {
//     try {

//         if (req.body) {

//             let cCid = new mongoose.Types.ObjectId(req.body.countryId)
//             let existingCCAndP = await Driver.findOne({ $and: [{ countryId: cCid }, { driverPhone: req.body.driverPhone }] });

//             console.log('yoooooooooo', existingCCAndP);
//             if (existingCCAndP) {
//                 let errorMessage = '';
//                 console.log('called');
//                 errorMessage = 'Phone number already exists!';
//                 deleteUploadedFile(req.file.filename);
//                 return res.status(400).json({ error: errorMessage });
//             }

//             let countryId = new mongoose.Types.ObjectId(req.body.countryId);
//             let cityId = new mongoose.Types.ObjectId(req.body.driverCity);
//             let newDriver = {
//                 countryId: countryId,
//                 cityId: cityId,
//                 driverProfile: req.file.filename,
//                 driverName: req.body.driverName,
//                 driverEmail: req.body.driverEmail,
//                 driverStripCustomerId: '',
//                 driverPhone: req.body.driverPhone,
//                 // serviceType: null,
//                 approveStatus: false
//             }


//             let addedDriver = await Driver.create(newDriver);
//             console.log('addeddriver====>', addedDriver);

//             if (addedDriver) {
//                 let stripCustomer = {
//                     name: addedDriver.driverName,
//                     email: addedDriver.driverEmail,
//                     phone: addedDriver.driverPhone,
//                     metadata: {
//                         customerType: 'Driver'
//                     }
//                 }


//                 stripe.customers.create(stripCustomer, async (err, customer) => {
//                     if (err) {
//                         console.log("Some Error Occured" + err);
//                         return res.status(500).json({ error: 'Stripe customer creation failed' });
//                     }
//                     if (customer) {
//                         console.log(customer);
//                         let stripCustomerId = customer.id;
//                         let updatedDriver = await Driver.findByIdAndUpdate(addedDriver._id, { driverStripCustomerId: stripCustomerId })
//                         console.log('done');

//                         if (updatedDriver) {

//                             let newDriver = await Driver.aggregate([
//                                 {
//                                     $match: {

//                                         _id: new mongoose.Types.ObjectId(updatedDriver._id)

//                                     }
//                                 },
//                                 {
//                                     $lookup: {
//                                         from: 'cityzones',
//                                         localField: 'cityId',
//                                         foreignField: '_id',
//                                         as: 'cityId'
//                                     }
//                                 },
//                                 {
//                                     $unwind: '$cityId'
//                                 },
//                                 {
//                                     $lookup: {
//                                         from: 'countries',
//                                         localField: 'countryId',
//                                         foreignField: '_id',
//                                         as: 'countryId'
//                                     }
//                                 },
//                                 {
//                                     $unwind: '$countryId'
//                                 }

//                             ])

//                             console.log('newly added user -----------', newDriver[0]);
//                             return res.status(200).send(newDriver[0], { message: 'added successfully' });
//                         }
//                     }
//                     else {
//                         console.log("Unknown Error");
//                     }
//                 })
//             }

//             console.log('done');
//         }

//     } catch (e) {
//         console.log(e);
//         if (e.code === 11000) {
//             const field = Object.keys(e.keyValue)[0];
//             let errorMessage = '';
//             if (field === 'driverEmail') {
//                 deleteUploadedFile(req.file.filename);
//                 errorMessage = 'Email already exists!';
//             } else if (field === 'driverPhone') {
//                 deleteUploadedFile(req.file.filename);
//                 errorMessage = 'Phone number already exists!';
//             }
//             return res.status(400).json({ error: errorMessage });
//         }
//         console.log('Error:', e);
//         return res.status(500).json({ error: 'Failed to add Driver' });
//     }
// }


const addDriver = async (req, res) => {
    try {

        if (req.body) {
            console.log('inside the adddriver ----->',req.body);
            // return ;
            let cCid = new mongoose.Types.ObjectId(req.body.countryId)
            let existingCCAndP = await Driver.findOne({ $and: [{ countryId: cCid }, { driverPhone: req.body.driverPhone }] });

            console.log('yoooooooooo', existingCCAndP);
            if (existingCCAndP) {
                let errorMessage = '';
                console.log('called');
                errorMessage = 'Phone number already exists!';
                deleteUploadedFile(req.file.filename);
                return res.status(400).json({ error: errorMessage });
            }

            let countryId = new mongoose.Types.ObjectId(req.body.countryId);
            let cityId = new mongoose.Types.ObjectId(req.body.driverCity);
            let newDriver = {
                countryId: countryId,
                cityId: cityId,
                driverProfile: req.file.filename,
                driverName: req.body.driverName,
                driverEmail: req.body.driverEmail,
                driverStripCustomerId: '',
                driverPhone: req.body.driverPhone,
                // serviceType: null,
                approveStatus: false
            }


            let addedDriver = await Driver.create(newDriver);
            console.log('newly added driver', addedDriver);

            const accountData = {
                type: 'custom', // or 'express'
                country: 'US',
                email: addedDriver.driverEmail,
                business_profile: {
                    name: addedDriver.driverName,
                    url: 'www.bhavesh.com', // Replace with actual URL
                    mcc: '5734', // Merchant Category Code
                    support_phone: '+12025550123', // Support phone number
                    support_email: 'support@example.com', // Support email
                    support_url: 'www.example.com/support', // Support URL
                },
                business_type: 'individual', // or 'company'
                individual: {
                    first_name: addedDriver.driverName,
                    last_name: addedDriver.driverName,
                    email: addedDriver.driverEmail,
                    phone: '+12025550123',
                    dob: {
                        day: 12,
                        month: 12,
                        year: 1995
                    },
                    address: {
                        city: 'LA',
                        country: 'US',
                        line1: 'LA',
                        line2: 'LA',
                        postal_code: '95014',
                        state: 'WA'
                    },
                    ssn_last_4: '0000',
                    id_number: '000000000', // You should never hardcode sensitive information like this. Use secure methods to handle it.
                },
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true }
                },
                metadata: {
                    customerType: 'Driver'
                },
                tos_acceptance: {
                    date: Math.floor(Date.now() / 1000),
                    ip: '8.8.8.8',
                },
            };

            if (addedDriver) {

                await initializeStripe();
                const account = await stripe.accounts.create(accountData);

                console.log('account', account);

                let stripCustomerId = account.id;
                let updatedDriver = await Driver.findByIdAndUpdate(addedDriver._id, { driverStripCustomerId: stripCustomerId }, { new: true })
                console.log('update driver', updateDriver);
                console.log('done');

                if (updatedDriver) {

                    let newDriver = await Driver.aggregate([
                        {
                            $match: {
                                // _id:addedDriver._id
                                _id: new mongoose.Types.ObjectId(updatedDriver._id)

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
                            $unwind: '$cityId'
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
                            $unwind: '$countryId'
                        }

                    ])

                    console.log('newly added user -----------', newDriver[0]);
                    return res.status(200).send(newDriver[0], { message: 'added successfully' });
                }

            }
            console.log('done');
        }

    } catch (e) {
        // console.log(e);
        if (e.code === 11000) {
            const field = Object.keys(e.keyValue)[0];
            let errorMessage = '';
            if (field === 'driverEmail') {
                deleteUploadedFile(req.file.filename);
                errorMessage = 'Email already exists!';
            } else if (field === 'driverPhone') {
                deleteUploadedFile(req.file.filename);
                errorMessage = 'Phone number already exists!';
            }
            return res.status(400).json({ error: errorMessage });
        }
        console.log('Error:', e);
        return res.status(500).json({ error: 'Failed to add Driver' });
    }
}


const getDrivers = async (req, res) => {
    try {
        console.log('inside getDrivers---------------', req.body);
        const page = req.body.page || 1;
        const limit = 2;
        let sort
        let sortStuff;
        if (req.body.sort !== 'none') {
            let sort = req.body.sort;
            sortStuff = { [sort]: 1 }
            console.log(sortStuff);
        } else {
            sort = null
        }

        let totalDrivers

        let Drivers;
        const searchTerm = req.body.searchTerm;

        let query = {};

        if (searchTerm) {
            query = {
                $or: [
                    { driverName: { $regex: new RegExp(searchTerm, 'i') } },
                    { driverEmail: { $regex: new RegExp(searchTerm, 'i') } },
                    { driverPhone: { $regex: new RegExp(searchTerm, 'i') } },
                    //  { _id: searchTerm.toLowerCase()}
                ]
            };
        }


        const aggregateQuery = [
            { $match: query },
            // { $sort: sortStuff }, 
            { $skip: (page - 1) * limit },
            { $limit: limit },

            {
                $lookup: {
                    from: 'cityzones',
                    localField: 'cityId',
                    foreignField: '_id',
                    as: 'cityId'
                }
            },
            { $unwind: "$cityId" },
            {
                $lookup: {
                    from: 'countries',
                    localField: 'countryId',
                    foreignField: '_id',
                    as: 'countryId'
                }
            },
            {
                $unwind: '$countryId'
            },
            {
                $lookup: {
                    from: 'vehicletypes',
                    localField: 'serviceType',
                    foreignField: '_id',
                    as: 'serviceType'
                }
            },
            {
                $addFields: {
                    serviceType: { $arrayElemAt: ["$serviceType", 0] } // Convert driverId array to object
                }
            },
        ];

        if (sort !== null) {
            // console.log('-------', sortStuff);
            aggregateQuery.unshift({ $sort: sortStuff });
        }

        // Drivers = await Driver.aggregate(aggregateQuery).collation({ locale: 'en', strength: 2 });
        Drivers = await Driver.aggregate(aggregateQuery).collation({ locale: 'en', strength: 2 });

        console.log('inside getDrivers---------------', Drivers);

        if (searchTerm) {
            totalDrivers = await Driver.countDocuments(query);
        } else {
            totalDrivers = await Driver.countDocuments();
        }
        if (Drivers.length === 0) {
            return res.status(400).json({ Message: 'There are no Drivers' });
        }

        return res.status(200).json({ totalDrivers: totalDrivers, Drivers: Drivers });
    } catch (e) {
        console.log('Error fetching drivers:', e);
        return res.status(500).json({ error: 'Failed to fetch drivers' });
    }
}

const updateDriver = async (req, res) => {
    try {
        console.log('got form the  req.body', req.body);
        const { id } = req.body

        let cCid = new mongoose.Types.ObjectId(req.body.countryId)
        let existingCCAndP = await Driver.findOne({ $and: [{ _id: { $ne: id } }, { countryId: cCid }, { driverPhone: req.body.driverPhone }] });

        console.log(existingCCAndP);
        if (existingCCAndP) {
            let errorMessage = '';
            errorMessage = 'Phone number already exists!';
            console.log('called');
            if (req.file) {
                deleteUploadedFile(req.file.filename);
            }
            return res.status(400).json({ error: errorMessage });
        }

        let updatedDriver

        console.log('--------------------');
        let newcityId = new mongoose.Types.ObjectId(req.body.driverCity);
        let oldCityId
        let driverProfile = req.file ? req.file : undefined
        if (driverProfile) {
            let driver = await Driver.findById(id);
            let oldFileNameObj = driver.driverProfile;
            oldCityId = driver.cityId
            let oldFileName = oldFileNameObj.driverProfile;

            if (newcityId == oldCityId) {
                updatedDriver = await Driver.findByIdAndUpdate(id,
                    {
                        driverName: req.body.driverName,
                        driverEmail: req.body.driverEmail,
                        driverPhone: req.body.driverPhone,
                        driverProfile: req.file.filename,
                        cityId: newcityId
                    }, { new: true });
            } else {
                updatedDriver = await Driver.findByIdAndUpdate(id,
                    {
                        driverName: req.body.driverName,
                        driverEmail: req.body.driverEmail,
                        driverPhone: req.body.driverPhone,
                        driverProfile: req.file.filename,
                        cityId: newcityId,
                        serviceType: null
                    }, { new: true });

            }

            deleteUploadedFile(oldFileName);
            // return res.status(200).send(updated[0]);
        } else {
            if (oldCityId == newcityId) {

                updatedDriver = await Driver.findByIdAndUpdate(id,
                    {
                        driverName: req.body.driverName,
                        driverEmail: req.body.driverEmail,
                        driverPhone: req.body.driverPhone,
                        cityId: newcityId
                    }, { new: true });

                console.log('----==========');
            } else {
                updatedDriver = await Driver.findByIdAndUpdate(id,
                    {
                        driverName: req.body.driverName,
                        driverEmail: req.body.driverEmail,
                        driverPhone: req.body.driverPhone,
                        cityId: newcityId,
                        serviceType: null
                    }, { new: true });
            }
        }

        let updated = await Driver.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(updatedDriver._id)
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
                $unwind: '$cityId'
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
                $unwind: '$countryId'
            },
            {
                $lookup: {
                    from: 'vehicletypes',
                    localField: 'serviceType',
                    foreignField: '_id',
                    as: 'serviceType'
                }
            },
            {
                $addFields: {
                    serviceType: { $arrayElemAt: ["$serviceType", 0] } // Convert driverId array to object
                }
            },
        ])



        return res.status(200).send(updated[0]);
    } catch (e) {
        console.log(e);
        if (e.code === 11000) {
            const field = Object.keys(e.keyValue)[0];
            let errorMessage = '';

            if (field === 'driverEmail') {
                errorMessage = 'Email already exists!';
                if (req.file) {
                    deleteUploadedFile(req.file.filename);
                }
            } else if (field === 'driverPhone') {
                errorMessage = 'Phone number already exists!';
            }
            return res.status(400).json({ error: errorMessage });
        }
        console.log('Error:', e);
        return res.status(500).json({ error: 'Failed to add driver' });
    }

}

const deleteDriver = async (req, res) => {
    try {
        await initializeStripe()
        let stripCustomer = await Driver.findById(req.body.id);
        let stripCustomerId = stripCustomer.driverStripCustomerId
        // console.log(stripCustomerId);

        let deleted = await stripe.accounts.del(stripCustomerId);
        console.log(deleted);
        const deletedDriver = await Driver.findByIdAndDelete(req.body.id);
        console.log(req.body);
        if (!deletedDriver) {
            console.log('Driver not found.');
            return;
        }
        let fileName = deletedDriver.driverProfile;
        if (!fileName) {
            console.log('Profile image not found for the Driver.');
            return res.status(404).json({ message: 'Profile image not found for the Driver' });
        }

        deleteUploadedFile(fileName);

        // console.log('Driver deleted successfully:', deletedDriver);
        return res.status(200).json(deletedDriver, { message: 'Driver deleted successfully' })
    } catch (e) {
        console.log('Error fetching Driver:', e);
        return res.status(500).json({ error: 'Failed to fetch vehicles' });
    }
}


const addService = async (req, res) => {
    try {
        console.log(req.body);
        if (req.body) {
            const { driverId, serviceId } = req.body;

            // let previousData = await Driver.findById(driverId, { serviceType: true });
            if (!req.body.serviceId) {
                // let updatedDriver = await Driver.findByIdAndUpdate(driverId, { serviceType: null }, { new: true }).populate('cityId');
                let updatedDriver = await Driver.findByIdAndUpdate(driverId, { serviceType: null }, { new: true });
                console.log('service removed');
                console.log(updatedDriver);
                if (updatedDriver) {

                    let response = {
                        Driver: updatedDriver,
                        Message: 'Service removed Successfully'
                    }
                    res.status(200).json(response);
                }
            } else {
                let serviceid = new mongoose.Types.ObjectId(serviceId)

                // let updatedDriver = await Driver.findByIdAndUpdate(driverId, { serviceType: serviceid }, { new: true }).populate('cityId').populate('serviceType');
                let updatedDriver = await Driver.findByIdAndUpdate(driverId, { serviceType: serviceid }, { new: true });
                if (updatedDriver) {
                    let updated = await Driver.aggregate([
                        {
                            $match: {
                                _id: new mongoose.Types.ObjectId(updatedDriver._id)
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
                            $unwind: '$cityId'
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
                            $unwind: '$countryId'
                        },
                        {
                            $lookup: {
                                from: 'vehicletypes',
                                localField: 'serviceType',
                                foreignField: '_id',
                                as: 'serviceType'
                            }
                        },
                        {
                            $addFields: {
                                serviceType: { $arrayElemAt: ["$serviceType", 0] } // Convert driverId array to object
                            }
                        },
                    ])

                    console.log('update *******' ,updated[0]);
                    console.log(updatedDriver);
                    let response = {
                        Driver: updated[0],
                        Message: 'Service Added Successfully'
                    }
                    res.status(200).json(response);
                }
            }
        }

    } catch (e) {
        console.log('Error Occured:', e);
        return res.status(500).json({ error: 'Failed to add service' });
    }
}


const approveDriver = async (req, res) => {
    try {
        console.log(req.body);
        if (req.body) {
            const { driverId, approveStatus } = req.body;
            let updatedDriver = await Driver.findByIdAndUpdate(driverId, { approveStatus: approveStatus }, { new: true });
            if (updatedDriver) {
                console.log("approveddriver --------", updatedDriver);
                let response = {
                    Driver: updatedDriver,
                    Message: 'updated successfully'
                }

                return res.status(200).json(response);
            } else {
                return res.status(404).json({
                    "error": "User Not Found",
                    "message": "The requested user could not be found in the database."
                });
            }
        } else {
            console.log('some unexprected error occured:');
            return res.status(400).json({ message: 'Some Error Occured' });
        }
    } catch (e) {
        console.log('Error occured:', e);
        return res.status(500).json({ error: 'Failed to set status' });
    }
}


const storeBankDetails = async (req, res) => {
    let response = {
        message: 'Some Server side Error has Occured',
        staus: 500
    }
    try {
        console.log('inside the driverController - storeBankDetails--------->', req.body);
        if (req.body) {
            await initializeStripe();
            let fetchedDriver = await Driver.findById(req.body.driverId);



            if (fetchedDriver) {
                // console.log('Fetcheddriver', fetchedDriver);
                const dCustomer = await stripe.accounts.retrieve(fetchedDriver.driverStripCustomerId);
                console.log('dcustomer ===>', dCustomer);

 
                if (req.body.token) {
                    console.log("token ", req.body.token);
                    const bankAccount = await stripe.accounts.createExternalAccount(
                        fetchedDriver.driverStripCustomerId,
                        { external_account: req.body.token }
                    );

                    console.log('Bank account added:', bankAccount);
                    await Driver.findByIdAndUpdate(fetchedDriver._id, { bankDetailsAdded: true })
                    if (bankAccount) {

                        response.message = 'Bank Account Added Successfully';
                        response.staus = 200
                        return res.status(200).json(response);
                    }
                }
            }
            response.staus = 404
            response.message = 'Error Fetching the Driver'
            return res.status(404).json(response);

        } else {
            console.log('some unexprected error occured:');
            response.message = 'No Request Body found'
            response.staus = 400
            return res.status(400).json(response);
        }
    } catch (e) {
        console.log('Error occured:', e);
        console.log('error.code', e.code);
        if (e.code == 'bank_account_exists') {
            response.message = 'The Bank Account is Already Exists'
            return res.status(500).json(response);
        }
        return res.status(500).json(response);
    }
}


function deleteUploadedFile(fileName) {
    console.log(fileName);
    if (!fileName) return;
    let profilePath = path.join(__dirname, '../public/driverProfile', fileName);
    fs.unlink(profilePath, (error) => {
        if (error) {
            console.error('Error occurred while deleting image file', error);
        } else {
            console.log('Image file deleted successfully');
        }
    });
}


module.exports = { Driver, storeBankDetails, addDriver, getDrivers, updateDriver, deleteDriver, addService, approveDriver }






