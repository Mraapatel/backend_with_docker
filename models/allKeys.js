const mongoose = require('mongoose');
const schema = new mongoose.Schema({
    objectType: String,
    keyValues: {
        type: Object,
        default: {}
    }
});


const allKeyModal = mongoose.model('allKeyModal', schema);

module.exports = { allKeyModal }