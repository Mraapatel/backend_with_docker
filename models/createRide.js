const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const { Counter } = require('./counter');

const createRideSchema = new Schema({
    Ride_index: {
        type: Number,
        unique: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        // ref:'User',
        required: true
    },
    typeId: {
        type: mongoose.Schema.Types.ObjectId,
        // ref:'vehicleType',
        required: true
    },
    cityId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    time: {
        type: Number,
        required: true
    },
    totalFare: {
        type: Number,
        required: true
    },
    route: {
        type: [String],
        required: true
    },
    paymentMethod: {
        type: String,
        required: true,
    },
    totalDistance: {
        type: Number,
        required: true
    },
    totalTime: {
        type: Number,
        required: true
    },
    totalFare: {
        type: Number,
        required: true
    },
    startLocation: {
        type: String,
        required: true
    },
    endLocation: {
        type: String,
        required: true
    },
    timeInString: {
        type: String,
        required: true
    },
    assignTime: {
        type: Number,
        default: null,
    },
    rideStatus: {
        type: Number,
        default: 0,
    },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    nearestdriverList: {
        type: [mongoose.Schema.Types.ObjectId],
        default: null
    },
    nearest: {
        type: Boolean,
        default: false
    },
    feedback: {
        type: {
            rating: Number,
            message: String
        },
        default: null
    }
})



// Pre-save middleware to increment the index
createRideSchema.pre('save', async function (next) {
    const doc = this;

    try {
        // Find and increment the count in the index tracking collection
        const count = await Counter.findOneAndUpdate(
            { index_name: 'Ride_index' }, // Ensure this document exists in the index tracking collection
            { $inc: { count: 1 } },
            { new: true, upsert: true } // Create the document if it doesn't exist
        );

        // Set the index field to the updated count
        doc.Ride_index = count.count;
        next();
    } catch (error) {
        next(error);
    }
});

const createRide = mongoose.model('createrides', createRideSchema);

module.exports = { createRide };