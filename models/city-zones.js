const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const zoneSchema = new Schema({
    countryId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    formatted_address: {
        type: String,
        required: true
    },
    place_id: {
        type: String,
        required: true
    },
    coordinates: {
        type: [[Number]],
        required: true,
    }
});

const City = mongoose.model('cityZone', zoneSchema);

// module.exports = { City }

