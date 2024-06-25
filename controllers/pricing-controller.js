const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const pricingSchema = new Schema({
    countryId: { type: mongoose.Schema.Types.ObjectId, required: true },
    cityId: { type: mongoose.Schema.Types.ObjectId, required: true },
    typeId: { type: mongoose.Schema.Types.ObjectId, required: true },
    driverProfit: { type: Number },
    minFare: { type: Number },
    distanceForBasePrice: { type: Number },
    basePrice: { type: Number },
    pricePerUnitDistance: { type: Number },
    pricePerUnitTime_Min: { type: Number },
    maxSpace: { type: Number }
});

const Pricing = mongoose.model('pricing', pricingSchema);

const addPrice = async (req, res) => {
    try {
        console.log(req.body);
        let isPresent = await Pricing.findOne({ $and: [{ countryId: req.body.countryId }, { cityId: req.body.cityId }, { typeId: req.body.typeId }] });

        let countryId = new mongoose.Types.ObjectId(req.body.countryId);
        let cityId = new mongoose.Types.ObjectId(req.body.cityId);
        let typeId = new mongoose.Types.ObjectId(req.body.typeId);

        let newPrice = {
            // countryName: req.body.countryName,
            // cityName: req.body.cityName,
            // vehicleType: req.body.vehicleType,
            countryId: countryId,
            cityId: cityId,
            typeId: typeId,
            driverProfit: req.body.driverProfit,
            minFare: req.body.minFare,
            distanceForBasePrice: req.body.distanceForBasePrice,
            basePrice: req.body.basePrice,
            pricePerUnitDistance: req.body.pricePerUnitDistance,
            pricePerUnitTime_Min: req.body.pricePerUnitTime_Min,
            maxSpace: req.body.maxSpace,
        }

        if (isPresent) {
            res.status(500).json({ message: 'This Pricing alredy exists' });
        } else {
            let newlyAdded = await Pricing.create(newPrice);

            let response = await Pricing.aggregate([
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(newlyAdded._id)
                    }
                },
                {
                    $lookup: {
                        from: "vehicletypes",
                        localField: "typeId",
                        foreignField: "_id",
                        as: "typeId",
                    },
                },
                {
                    $unwind: "$typeId",
                },
                {
                    $lookup: {
                        from: "countries",
                        localField: "countryId",
                        foreignField: "_id",
                        as: "countryId",
                    },
                },
                {
                    $unwind: "$countryId",
                },

                {
                    $lookup: {
                        from: "cityzones",
                        localField: "cityId",
                        foreignField: "_id",
                        as: "cityId",
                    },
                },

                {
                    $unwind: "$cityId",
                },
                {
                    $project: {
                        __v: 0,
                        "countryId.timeZone": 0,
                        "countryId.flagSymbol": 0,
                        "countryId.__v": 0,
                        "cityId.zone": 0,
                        "cityId.__v": 0,
                        "cityId.place_id": 0,
                        "typeId.vehicleIcon": 0,
                        "typeId.__v": 0,
                    }
                }
            ])


            res.status(200).json(response[0], { message: 'Price saved successfully' });

        }
    } catch (e) {
        console.log(e);
    }
}

const getPrice = async (req, res) => {
    try {
        let PriceList = [];
        PriceList = await Pricing.aggregate([
            {
                '$lookup': {
                    from: 'vehicletypes',
                    localField: 'typeId',
                    foreignField: '_id',
                    as: 'typeId'
                }
            },
            {
                $unwind: '$typeId'
            },
            {
                '$lookup': {
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
                '$lookup': {
                    from: 'cityzones',
                    localField: 'cityId',
                    foreignField: '_id',
                    as: 'cityId'
                }
            },

            {
                $unwind: '$cityId'
            }
        ]);

        if (PriceList) {
            res.status(200).json(PriceList, { message: 'Prices feteched successfully' });
        } else {
            res.status(500).json({ message: 'No Prices exists' });

        }

        // console.log(PriceList);
    } catch (e) {
        console.log(e);
    }
}

const getCountry = async (req, res) => {
    try {
        console.log('inside the getCountry --->',req.body);
        let countryList = [];
        countryList = await Pricing.aggregate([

            {
                $group: {
                    _id: "$countryId",
                },
            },
            {
                $lookup: {
                    from: 'countries',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'country'
                }
            },
            {
                $unwind: {
                    path: '$country',
                    // includeArrayIndex: 'string',
                    // preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 0
                }
            }

        ]);

        if (countryList) {
            res.status(200).json(countryList, { message: 'countries feteched successfully' });
        } else {
            res.status(500).json({ message: 'No country exists' });

        }

        // console.log(PriceList);
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: 'No country exists' });
    }
}

const updatePrice = async (req, res) => {
    try {

        console.log('inside updatePrice ---->', req.body);
        let updatedPrice = await Pricing.findByIdAndUpdate({ _id: req.body.PriceId }, {
            driverProfit: req.body.driverProfit,
            basePrice: req.body.basePrice,
            maxSpace: req.body.maxSpace,
            pricePerUnitDistance: req.body.pricePerUnitDistance,
            pricePerUnitTime_Min: req.body.pricePerUnitTime_Min,
            minFare: req.body.minFare,
            distanceForBasePrice: req.body.distanceForBasePrice
        }, { new: true });

        let response = await Pricing.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(req.body.PriceId)
                }
            },
            {
                $lookup: {
                    from: "vehicletypes",
                    localField: "typeId",
                    foreignField: "_id",
                    as: "typeId",
                },
            },
            {
                $unwind: "$typeId",
            },
            {
                $lookup: {
                    from: "countries",
                    localField: "countryId",
                    foreignField: "_id",
                    as: "countryId",
                },
            },
            {
                $unwind: "$countryId",
            },

            {
                $lookup: {
                    from: "cityzones",
                    localField: "cityId",
                    foreignField: "_id",
                    as: "cityId",
                },
            },

            {
                $unwind: "$cityId",
            },
            {
                $project: {
                    __v: 0,
                    "countryId.timeZone": 0,
                    "countryId.flagSymbol": 0,
                    "countryId.__v": 0,
                    "cityId.zone": 0,
                    "cityId.__v": 0,
                    "cityId.place_id": 0,
                    "typeId.vehicleIcon": 0,
                    "typeId.__v": 0,
                }
            }
        ]);

        console.log(response);

        if (updatedPrice && response) {
            return res.status(200).json(response[0], { message: 'Updated successfully' });
        } else {
            return res.status(404).json({ message: 'No such Pricing found' });
        }

    } catch (e) {
        console.log(e);
    }
}

const getCity = async (req, res) => {
    try {
        if (req.body) {
            console.log('Inside the getCity price.js--->', req.body);

            let cities = await Pricing.aggregate([

                {
                    $match: {
                        countryId: new mongoose.Types.ObjectId(req.body.countryId)
                    },
                },
                {
                    $group: {
                        _id: "$cityId",
                    },
                },
                {
                    $lookup: {
                        from: "cityzones",
                        localField: "_id",
                        foreignField: "_id",
                        as: "city",
                    },
                },
                {
                    $unwind: {
                        path: "$city",
                    },
                },
                {
                    $project: {
                        _id: 0,
                        "city._id": 1,
                        "city.coordinates": 1,
                    },
                },
                {
                    $replaceRoot: { newRoot: "$city" },
                },

            ]);

            if (cities) {
                let response = {
                    status: 'Cties Found',
                    cities: cities
                }
                console.log(cities);
                return res.status(200).json(response, { message: 'Cities fetched successfully' });

            }
        }



        // console.log(response);

        // if (updatedPrice && response) {
        // } else {
        return res.status(404).json({ message: 'No Cities found' });
        // }

    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: 'Server  Error' });
    }
}

const getCityPricig = async (req, res) => {
    let response = {
        status: 'Error',
        pricings: []
    }
    try {
        if (req.body) {
            console.log('inside the gecityPricing ----->');
            const { cityId } = req.body;
            let pricing = await Pricing.aggregate([
                {
                    $match: {
                        cityId: new mongoose.Types.ObjectId(cityId)
                    }
                },

                {
                    $lookup: {
                        from: "vehicletypes",
                        localField: "typeId",
                        foreignField: "_id",
                        as: "typeId",
                    },
                },
                {
                    $unwind: {
                        path: "$typeId",
                    },
                },
                {
                    $project: {
                        __v: 0,
                        "typeId.__v": 0,
                    },
                },
            ])
            if (pricing) {
                response.pricings = pricing;
                response.status = 'Success';
                console.log(pricing);
                return res.status(200).json(response);

            }
            return res.status(404).json(response);
        }
    } catch (e) {
        console.log(e);
        response.status = 'Internal server Error'
        return res.status(500).json(response);

    }
}

module.exports = { Pricing, addPrice, getPrice, updatePrice, getCountry, getCity, getCityPricig }