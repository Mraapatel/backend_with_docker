const express = require('express');
const routes = express.Router();
const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const countrySchema = new Schema({
    country: {
        type: String,
        required: true,
        max: 15
    },
    currency: {
        type: String,
        max: 5,
        required: true
    },
    countryCode: {
        type: String,
        required: true,
        max: 5
    },
    countryCallingCode: {
        type: String,
        required: true,
        max: 5
    },
    timeZone: {
        type: String,
        required: true,
    },
    flagSymbol: {
        type: String,
        required: true,
    },
    countryCode2: {
        type: String,
        required: true
    }
});
const Country = mongoose.model('countries', countrySchema);


routes.post('/', async (req, res) => {
    try {

        let existingCountry = await Country.findOne({ country: req.body.country })
        if (existingCountry) {
            return res.status(400).send( { message: 'This country already exists' });
        }

        const { country, currency, countryCode, countryCallingCode, timeZone, flagSymbol, countryCode2 } = req.body

        let newCountry = {
            country: country,
            currency: currency,
            countryCode: countryCode,
            countryCallingCode: countryCallingCode,
            timeZone: timeZone,
            flagSymbol: flagSymbol,
            countryCode2: countryCode2,

        }
        console.log(countryCode2);

        let addedCountry = await Country.create(newCountry);
        return res.status(200).send(addedCountry, { message: 'New Country added successfully' });
    } catch (e) {
        console.log('some error happened', e);
        return res.status(500).send({ message: 'Some error occured' });
    }

});

routes.get('/', async (req, res) => {
    try {
        console.log('inside the country get');
        let countries = await Country.find();
        return res.status(200).send(countries, { message: 'Found countries' });
    } catch (e) {
        console.log('some error happened', e);
        return res.status(500).send({ message: 'Some error occured' });
    }
});


routes.post('/searchCountry', async (req, res) => {
    try {
        console.log(req.body);
        let matchedCountry = await Country.find({
            $or: [
                { country: { $regex: new RegExp(req.body.search, 'i') } },
                { countryCode: { $regex: new RegExp(req.body.search, 'i') } },
                { currency: { $regex: new RegExp(req.body.search, 'i') } },
                { countryCallingCode: { $regex: new RegExp(req.body.search, 'i') } },
            ]
        });
        return res.status(200).send(matchedCountry, { message: 'Found  countries new bro' });

    } catch (e) {
        console.log('some error happened', e);
        return res.status(500).send({ message: 'Some error occured' });
    }
});

module.exports = routes


