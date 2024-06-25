const { allKeyModal } = require('../models/allKeys');


const fetchKeys = async (objeType) => {
    try {
        if (objeType === 'email') {
            return await allKeyModal.findOne({ objectType: objeType });
        } else if (objeType === 'twilio') {
            return await allKeyModal.findOne({ objectType: objeType });
        } else if (objeType === 'stripe') {

            let keys =  await allKeyModal.findOne({ objectType: objeType });
            return keys.keyValues.secreateKey
        }

    } catch (e) {
        console.log('Error Occured while fetching keys', e);
    }
}

module.exports = { fetchKeys }