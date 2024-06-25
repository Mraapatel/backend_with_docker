const { createRide } = require('../models/createRide');
const { Driver } = require('../controllers/driverList-controller');
const { User } = require('../controllers/user-controller');
const { Pricing } = require('../controllers/pricing-controller');

const mongoose = require('mongoose');
const { fetchKeys } = require('../utils/fetchKeys');

const { getRidesFormDb } = require('../utils/fetchRides');
const { fetchIdleDrivers } = require('../utils/fetchIdleDrivers');
const { addFunds } = require('../utils/addFunds');
const { sendEmail } = require('../utils/email');
const { getCount} = require('../utils/comman')
// const secreat_strip_key = await fetchKeys('stripe')
// const stripe = require('stripe')(secreat_strip_key);
let stripe = null



const initializeStripe = async () => {
    try {
        let publickey = await fetchKeys('stripe');
        stripe = require('stripe')(publickey);

    } catch (e) {
        console.log('error in initializeStripe', e);
    }

}

const getRides = async (req, res) => {
    try {
        let response = {
            message: 'Error occured',
        }
        if (req.body) {
            console.log('inside the confirmRide getRides ------->', req.body);
            // console.log(req.body);

            // return;
            let got = await getRidesFormDb(req.body.page, req.body.limit, req.body.searchTerm, req.body.vechicleType, req.body.date, req.body.rideStatus)
            console.log('got-------->', got);

            return res.status(200).json(got);
        } else {
            response.message = 'Some Error Occured while storing Ride'
            return res.status(400).json(response);
        }
    } catch (e) {
        console.log('error while storing ride details', e);

    }
}

const getVehicleTypes = async (req, res) => {
    console.log('here');
    try {
        let response = {
            message: 'Error occured',
            TypesArray: []
        }


        console.log('inside the confirmRide getVehicleTypes ------->', req.body);
        let vehicleType = await createRide.aggregate([
            {
                $group: {
                    _id: "$typeId"
                }
            },
            {
                $lookup: {
                    from: "vehicletypes",
                    localField: "_id",
                    foreignField: "_id",
                    as: "type"
                }
            },
            {
                $unwind: {
                    path: "$type"
                }
            },
            {
                $project: {
                    _id: 0,
                    'type.__v': 0
                }
            }
        ]);

        if (vehicleType) {
            vehicleType.forEach((type) => {
                response.TypesArray.push(type.type);
            });
            response.message = 'Feteched vehicletypes'
        }


        return res.status(200).json(response);

    } catch (e) {
        response.message = 'Some Error Occured while Feteching vehicleTypes'
        console.log('Error Occured while Feteching vehicleTypes', e);
        return res.status(400).json(response);

    }
}

const getDrivers = async (req, res) => {
    let response = {
        message: 'Error occured',
        driverArray: []
    }
    try {

        console.log('inside the confirmride - getdrivers---->', req.body);
        let Drivers = await fetchIdleDrivers(req.body.cityId, req.body.typeId, req.body.rideStatus)
        /* 
        let Drivers = await Driver.aggregate(
            [
                {
                    $match: {
                        cityId: new mongoose.Types.ObjectId(req.body.cityId),
                        serviceType: new mongoose.Types.ObjectId(req.body.typeId),
                        approveStatus: true,
                        driverStatus: 0
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
        */

        // global.ioInstance.emit('dakfja', 'broooooo  this is form the server ')
        // console.log('ioInstance----->',global.ioInstance);

        if (Drivers.length > 0) {
            response.driverArray = Drivers;
            response.message = 'Driver fetched successfully'
            // console.log(Drivers);
         return   res.status(200).json(response);
        }
        response.message = 'No Driver Found'
       return res.status(404).json(response);

    } catch (e) {
        response.message = 'Some Error Occured while Feteching drivers'
        console.log('Error Occured while Feteching drivers', e);
        return res.status(400).json(response);
    }
}

const assignNearestDriver = async (req, res) => {
    try {

        if (req.body) {
            console.log('Inside the confirmRide -  assignNearestDriver ', req.body);
            // let time = new Date().getTime();

            let ride = await createRide.findByIdAndUpdate(req.body.rideId, {
                nearest: true, rideStatus: 1
            }, { new: true });
            global.ioInstance.emit('updatedCount', await getCount());

            if (ride) {
                return res.status(200).json({ message: 'The ride will be Assigned' });
            }
            return res.status(404).json({ message: 'Some Error occured while assigning ride' });
        }
    } catch (e) {
        response.message = 'Some Error Occured while Feteching drivers'
        console.log('Error Occured while Feteching drivers', e);
        return res.status(400).json(response);
    }
}

const cancleRide = async (req, res) => {
    try {

        if (req.body) {
            console.log('Inside the confirmRide -  cancleRide --> ', req.body);

            let ride = await createRide.findByIdAndUpdate(req.body.rideId, {
                nearest: false, rideStatus: 8
            }, { new: true })

            if (req.body.driverId) {
                await Driver.findByIdAndUpdate(req.body.driverId, {
                    driverStatus: 0
                })
            }

            if (ride) {
                let data = {
                    rideStatus: ride.rideStatus,
                    rideId: ride._id
                }
                global.ioInstance.emit('rideCancledByAdmin', data)
                return res.status(200).json({ message: 'The ride cancled successfully', rideStatus: ride.rideStatus, rideId: ride._id });
            }
            return res.status(404).json({ message: 'Some Error occured while canceling ride' });
        }
    } catch (e) {
        response.message = 'Some Error occured at server while canceling ride'
        console.log('Error Occured while canceling ride', e);
        return res.status(500).json(response);
    }
}


const rideStarted = async (req, res) => {
    try {

        if (req.body) {
            console.log('Inside the confirmRide -  rideStarted --> ', req.body);
            // let time = new Date().getTime();

            let ride = await createRide.findByIdAndUpdate(req.body.rideId, {
                rideStatus: 4,
            }, { new: true })


            if (ride) {
                let data = {
                    rideStatus: ride.rideStatus,
                    rideId: ride._id
                }
                global.ioInstance.emit('driverStartedMovingToUser', data)
                return res.status(200).json({ message: 'Driver Started Moving To User', rideStatus: ride.rideStatus, rideId: ride._id });
            }
            return res.status(404).json({ message: 'Some Error occured while starting the ride' });
        }
    } catch (e) {
        response.message = 'Some Error occured while starting the ride'
        console.log('Error Occured while starting the ride', e);
        return res.status(400).json(response);
    }
}


const rideArrived = async (req, res) => {
    try {

        if (req.body) {
            console.log('Inside the confirmRide -  rideArrived --> ', req.body);
            // let time = new Date().getTime();

            let ride = await createRide.findByIdAndUpdate(req.body.rideId, {
                rideStatus: 2,
            }, { new: true })


            if (ride) {
                let data = {
                    rideStatus: ride.rideStatus,
                    rideId: ride._id
                }
                global.ioInstance.emit('DriverArrivedToUser', data)
                return res.status(200).json({ message: 'Driver Arrived To User', rideStatus: ride.rideStatus, rideId: ride._id });
            }
            return res.status(404).json({ message: 'Some Error occured while Assigning-- rideArrived' });
        }
    } catch (e) {
        response.message = 'Some Error occured while Assigning-- rideArrived'
        console.log('Error Occured while Assigning-- rideArrived', e);
        return res.status(400).json(response);
    }
}


const ridePicked = async (req, res) => {
    try {

        if (req.body) {
            console.log('Inside the confirmRide -  ridePicked --> ', req.body);
            // let time = new Date().getTime();

            let ride = await createRide.findByIdAndUpdate(req.body.rideId, {
                rideStatus: 3,
            }, { new: true })


            if (ride) {
                let data = {
                    rideStatus: ride.rideStatus,
                    rideId: ride._id
                }
                global.ioInstance.emit('driverStartedTrip', data)
                return res.status(200).json({ message: 'Driver started trip', rideStatus: ride.rideStatus, rideId: ride._id });
            }
            return res.status(404).json({ message: 'Some Error occured while Assigning-- ridePicked' });
        }
    } catch (e) {
        response.message = 'Some Error occured while Assigning-- ridePicked'
        console.log('Error Occured while Assigning-- ridePicked', e);
        return res.status(400).json(response);
    }
}


const rideCompleted = async (req, res) => {
    let response = {
        userPayment: 'Error Occured while completing ride',
        driverPayment: 'Error Occured while completing ride',
        status: 500,
        rideStatus: null,
        rideId: '',
    }
    try {

        if (req.body) {
            console.log('Inside the confirmRide -  rideCompleted --> ', req.body);

            let ride = await createRide.findByIdAndUpdate(req.body.rideId, {
                rideStatus: 7,
            }, { new: true })

            if (ride) {
                await Driver.findByIdAndUpdate(ride.driverId, { driverStatus: 0 });
                // await addFunds()
                response.rideId = ride._id;
                response.rideStatus = ride.rideStatus
                response.status = 200;
                let userPayment = await collectFormUser(ride);
                let driverPayment = await payToDriver(ride);
                response.userPayment = userPayment;
                response.driverPayment = driverPayment

                if (userPayment.length > 37) {
                    response.status = 201;
                }
                let data = {
                    rideStatus: ride.rideStatus,
                    rideId: ride._id
                }
                global.ioInstance.emit('driverEndedTrip', data)
                return res.status(200).json(response)
            }

            response.userPayment = 'Not able to find the ride';
            response.status = 404;
            return res.status(404).json(response);
        }
    } catch (e) {
        response.userPayment = 'Some Error occured while completing ride'
        console.log('Error Occured while completing ride', e);
        return res.status(500).json(response);
    }
}


async function collectFormUser(ride) {
    await initializeStripe();

    let user = await User.findById(ride.userId);
    await sendEmail('haramilond@gmail.com', user.userName, ride.totalFare, 'stripe.com');
    if (ride.paymentMethod === 'card') {

        // done
        if (user.stripCustomerId) {
            const customer = await stripe.customers.retrieve(user.stripCustomerId)
            console.log('Customer===>', customer);
            // done
            if (customer.default_source) {
                console.log('default Card is present');
                return await createCharge(user.stripCustomerId, ride.totalFare, customer.default_source, user.userName)

            } else {
                console.log(' users default Card is not present');
                return 'User do not have Card Added';
            }
        }
        return `User do not have Customer Id`;
    } else {
        return 'Payment method for Ride was Cash';
    }
}

async function payToDriver(ride) {
    try {
        let dCustomer = await checkForDriver(ride.driverId);
        // done
        if (dCustomer) {
            let payableAmount = await amountPayble(ride.cityId, ride.typeId, ride.totalFare);
            console.log('payable ammount', payableAmount);
            let payout = await createPayout(dCustomer.id, payableAmount)
            // done
            if (payout) {
                console.log('all the conditions were true', payout.object);
                return 'Collected From User and Paid to Driver also';
            } else {
                console.log('last condition were not  true', payout);
                return 'Collected From User but unable Pay to Driver ';
            }
        } else {
            return 'Driver do not have Account';
        }

    } catch (e) {
        console.log('Error Occured While Charging the Customer', e);
        return null
    }
}


async function createCharge(customerId, amount, paymentMethodId, userName) {
    try {
        await initializeStripe();
        console.log('customerId', customerId);
        console.log('amount', amount);
        console.log('paymentMethodId', paymentMethodId);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: 2 * 100,  // Amount in cents
            currency: 'usd',
            customer: customerId,
            description: `Ride fare of ${userName}`,
            payment_method: paymentMethodId, // Existing payment method ID
            payment_method_types: ['card'],
            receipt_email: 'example@gmail.com',
            metadata: {
                order_id: '6735',
                user_name: userName
            },
            shipping: {
                name: userName,
                address: {
                    line1: '1234 Main Street',
                    city: 'San Francisco',
                    state: 'CA',
                    postal_code: '94111',
                    country: 'US'
                }
            },
            setup_future_usage: 'off_session', // Save the payment method for future off-session use
            // statement_descriptor: 'CUSTOM RIDE',
            capture_method: 'automatic',
            confirm: true,
            // confirmation_method: 'automatic',
            return_url: 'http://localhost:4200/home/rideHistory'
        });


        if (paymentIntent.status === 'succeeded') {
            console.log('Payment successful:', paymentIntent);
            return 'Payment Collected From the User'
            // Payment succeeded, handle success scenario (redirect user, update UI, etc.)
        } else if (paymentIntent.status === 'requires_action') {
            console.log('failure of payment:', paymentIntent);
            return paymentIntent.next_action.redirect_to_url.url
            // window.location.replace(paymentIntent.next_action.redirect_to_url.url);
        } else {
            console.log('else condition', paymentIntent);
        }

        console.log('charge ', paymentIntent);
        return 'Not able Collect From User'
    } catch (e) {
        console.log('Error Occured While Charging the Customer', e);
        return 'Error Occured While Charging the Customer'
    }
}


async function checkForDriver(driverId) {
    try {
        await initializeStripe();

        let driver = await Driver.findById(driverId);

        console.log("driverId", driverId);
        console.log("driver iin checkfordriver---------->", driver);

        if (driver) {
            return new Promise((resolve, reject) => {
                stripe.accounts.retrieve(driver.driverStripCustomerId, (err, dCustomer) => {
                    if (err) {
                        console.error(err);
                        reject(err);
                    } else {
                        console.log('dcustomer ===>', dCustomer.id);
                        resolve(dCustomer);
                    }
                });
            });
        }
        return null;
    } catch (e) {
        console.log('Error Occured while checking bank for driver', e);
        return null
    }
}

async function createPayout(customerId, amount) {
    try {
        await initializeStripe();

        console.log('amount', amount);
        console.log('default_source', customerId);
        const payout = await stripe.transfers.create({
            amount: amount * 100,
            currency: 'usd',
            destination: customerId,
        })

        return payout
    } catch (e) {
        console.log("some Error Occured while creating Payout", e);
        return null
    }
}

async function amountPayble(cityId, typeId, amount) {
    try {
        let pricing = await Pricing.findOne({ cityId: new mongoose.Types.ObjectId(cityId), typeId: new mongoose.Types.ObjectId(typeId) })
        console.log('Pricing for that city====>', pricing);

        if (pricing) {
            console.log('(amount * pricing.driverProfit) / 100;', (amount * pricing.driverProfit) / 100);
            let t = amount * pricing.driverProfit;
            let l = t / 100
            console.log('t', t);
            console.log('l', parseFloat(l.toFixed(2)));
            return parseFloat(l.toFixed(2));
        } else {
            return null;
        }
    } catch (e) {
        console.log("some Error Occured in amountPayble", e);
        return null;
    }
}


module.exports = { getRides, getVehicleTypes, getDrivers, assignNearestDriver, cancleRide, rideStarted, rideArrived, ridePicked, rideCompleted, initializeStripe }