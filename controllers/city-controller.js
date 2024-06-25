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
    zone: {
        type: {
            type: String,
            default: 'Polygon',
            enum: ['Polygon'],
            required: true
        },
        coordinates: {
            type: [[[Number]]],
            required: true,
        }
    }
});

zoneSchema.index({ zone: '2dsphere' });

const City = mongoose.model('cityZone', zoneSchema);

// mongoose.connect('mongodb://127.0.0.1:27017/Product')
//     .then(() => console.log('connection is successfull...'))
//     .catch((error) => console.log(error));


const addZone = async (req, res) => {
    try {
        let countryId = new mongoose.Types.ObjectId(req.body.countryId);
        let newZone = {
            countryId: countryId,
            formatted_address: req.body.cityName,
            place_id: req.body.place_id,
            zone: {
                // type: 'Polygon',
                coordinates: req.body.coordinates[0] // Ensure the coordinates are correctly nested
            }
        }
        console.log('newZone.zone.coordinates[0]', newZone.zone.coordinates[0]);
        // return null
        let isok = await City.findOne({ formatted_address: req.body.cityName });
        console.log('newZone------->', newZone.zone.coordinates[0]);
        if (isok) {
            res.status(500).send({ message: 'The Zone for this city already exists' });
        } else {
            let returned = await City.create(newZone);
            res.status(200).send(returned, { message: 'added successfully' });
        }
    } catch (e) {
        console.log(e);
    }
}

const getCountries = async (req, res) => {
    try {
        let cities = []
        cities = await City.find({ countryId: req.body.countryId });
        // console.log(req.body);
        res.status(200).json(cities);
        if (cities.length < 0) {
            res.json({ Message: 'There is no current cities with zone' })
        }
    } catch (e) {
        console.log('Error fetching vehicles:', e);
        res.status(500).json({ error: 'Faild to fetch cities ' })
    }
}

const getCities = async (req, res) => {
    try {

        console.log(req.body);

        let citylist = await City.aggregate([
            {
                $match: {
                    countryId: new mongoose.Types.ObjectId(req.body.countryId)
                }
            }
        ])

        console.log('inside geCities ---->', citylist);
        res.status(200).json(citylist);
    } catch (e) {
        console.log('Error fetching cities:', e);
        res.status(500).json({ error: 'Faild to fetch cities ' })
    }
}

const saveChangedZone = async (req, res) => {
    try {
        console.log('inside the saveChangedZone', req.body);
        // return
        let isPresent = await City.findOne({ _id: req.body.cityId });
        if (isPresent) {
            console.log('city is present');
            let updatedZone = await City.findByIdAndUpdate(
                { _id: req.body.cityId },
                {
                    zone: {
                        coordinates: req.body.coordinates,
                        type:'Polygon'
                    }
                }, { new: true })
            return res.status(200).json(updatedZone, { Message: 'The Zone is updated successfully' })
        }
        // console.log(req.body);
        return res.status(404).json({ Message: 'There is no current zone for this city' })
    } catch (e) {
        console.log('Error fatching the city', e);
        return res.status(500).json({ error: 'Faild to fetch city ' })
    }
}

module.exports = { City, addZone, getCountries, saveChangedZone, getCities }