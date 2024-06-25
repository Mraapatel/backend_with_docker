const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const fs = require('fs');
const path = require('path');

const VehicleSchema = new Schema({
    vehicleType: {
        type: String,
        required: true
    },
    vehicleIcon: {
        type: String,
        required: true,
    }
});

const vechicle = mongoose.model('vehicleType', VehicleSchema);

// mongoose.connect('mongodb://127.0.0.1:27017/Product')
//     .then(() => console.log('connection is successfull...'))
//     .catch((error) => console.log(error));

const addVehicleType = async (req, res) => {
    try {
        const { vehicleType, vehicleIcon } = req.body;
        console.log(req.body);
        let vehicleT = vehicleType.trim().toUpperCase();

        let isPresent = await vechicle.find({ vehicleType: vehicleT });
        if (isPresent.length > 0) {
            console.log('here');
            if (req.file) {
                deleteUploadedFile(req.file.filename)
            }
            return res.status(409).json({ message: 'this vehicle type already exists' });
        }
        console.log('-----------');
        console.log(isPresent);
        console.log('-----------');
        const newVehicle = new vechicle({
            vehicleType: vehicleT,
            vehicleIcon: req.file.filename,
        });

        let got = await vechicle.create(newVehicle);
        console.log(got);

        return res.status(200).send(got, { message: 'added successfully' });

    } catch (e) {
        console.log(e);
    }
}

const allVehicles = async (req, res) => {
    try {
        console.log('inside the getallvehicles------>',req.body);
        if (req.body) {

            if (req.body.countryId !== 'none') {

                console.log(req.body);
                const { countryId } = req.body
                let c = new mongoose.Types.ObjectId(countryId)
                let services = await vechicle.aggregate([
                    {
                        $lookup: {
                            from: "pricings",
                            localField: "_id",
                            foreignField: "typeId",
                            as: "got",
                        },
                    },
                    {
                        $unwind: "$got",
                    },
                    {
                        $group: {
                            _id: "$got.countryId",
                            documents: { $push: "$$ROOT" }
                        },
                    },
                    {
                        $match: {
                            _id: new mongoose.Types.ObjectId(countryId)
                        }
                    },
                    {
                        $project: {
                            '_id': 0,
                            "documents.got": 0
                        }
                    },
                    {
                        $unwind: '$documents'
                    }

                ])
                console.log('In allvehicles --------->>', services);

                res.status(200).json(services)
            } else {

                let allVehicles = []
                allVehicles = await vechicle.find();
                res.status(200).json(allVehicles);
                if (allVehicles.length < 0) {
                    return res.json({ Message: 'There is no current vehicles' })
                }
            }
        } else {
            return res.status(400).json({ error: 'dont get the request body' })
        }
    } catch (e) {
        console.log('Error fetching vehicles:', e);
        return res.status(500).json({ error: 'Faild to fetch vehicles ' })
    }
}

const allServices = async (req, res) => {
    try {
        if (req.body) {
            console.log('inside theh allServices controller --->',req.body);

            if (req.body.countryId !== 'none') {

                console.log(req.body);
                const { countryId ,cityId } = req.body
                let c = new mongoose.Types.ObjectId(countryId)
                let services = await vechicle.aggregate([
                    {
                        $lookup: {
                            from: "pricings",
                            localField: "_id",
                            foreignField: "typeId",
                            as: "got"
                        }
                    },
                    {
                        $unwind: "$got"
                    },
                    {
                        $match: {
                            "got.countryId": new mongoose.Types.ObjectId(countryId),
                            "got.cityId": new mongoose.Types.ObjectId(cityId)
                        }
                    },
                    {
                        $project: {
                            got: 0,
                            __v: 0
                        }
                    }
                ])
                console.log('In allvehicles --------->>', services);

                res.status(200).json(services)
            } else {

                let allVehicles = []
                allVehicles = await vechicle.find();
                res.status(200).json(allVehicles);
                if (allVehicles.length < 0) {
                    return res.json({ Message: 'There is no current vehicles' })
                }
            }
        } else {
            return res.status(400).json({ error: 'dont get the request body' })
        }
    } catch (e) {
        console.log('Error fetching vehicles:', e);
        return res.status(500).json({ error: 'Faild to fetch vehicles ' })
    }
}

function deleteUploadedFile(fileName) {
    if (!fileName) return;
    let profilePath = path.join(__dirname, '../public/vehicleTypes', fileName);
    fs.unlink(profilePath, (error) => {
        if (error) {
            console.error('Error occurred while deleting image file', error);
        } else {
            console.log('Image file deleted successfully');
        }
    });
}

// const allVehiclesForPricing = async (req, res) => {
//     try {
//         const allVehicles = await Vehicle.aggregate([
//             {
//                 $lookup: {
//                     from: 'otherCollection', // Replace 'otherCollection' with the actual name of the collection
//                     localField: '_id',
//                     foreignField: 'typeId',
//                     as: 'matchedDocuments'
//                 }
//             },
//             {
//                 $match: {
//                     matchedDocuments: { $ne: [] } // Filter only vehicles with matching documents
//                 }
//             }
//         ]);

//         if (allVehicles.length > 0) {
//             res.status(200).json(allVehicles);
//         } else {
//             res.json({ Message: 'There are no vehicles with matching documents' });
//         }
//     } catch (e) {
//         console.log('Error fetching vehicles:', e);
//         res.status(500).json({ error: 'Failed to fetch vehicles' });
//     }
// }


const editVehicleType = async (req, res) => {
    let changed
    const { _id, vehicleName } = req.body
    // console.log('1111--------------------------------------');
    console.log('inside the editvehicleType ------------->',req.body);

    let vehicleT = vehicleName.trim().toUpperCase();

    let isPresent = await vechicle.find({ vehicleType: vehicleT, _id: { $ne: _id } });

    if (isPresent.length > 0) {

        console.log('2222--------------------------------------');

        if (req.file) {
            deleteUploadedFile(req.file.filename);
        }
        return res.status(409).json({ message: 'this vehicle type already exists' });
    }

    if (req.file == undefined) {
        if (vehicleName) {
            changed = await vechicle.findByIdAndUpdate(_id, { vehicleType: req.body.vehicleName.trim().toUpperCase() }, { new: true })
            // console.log(changed)
            res.status(200).send(changed);
        }
    }

    if (req.file !== undefined) {
        if (vehicleName) {
            let old = await vechicle.findById(_id);
            console.log('old', old);
            console.log('3333--------------------------------------');

            deleteUploadedFile(old.vehicleIcon);
            changed = await vechicle.findByIdAndUpdate(_id, { vehicleIcon: req.file.filename, vehicleType: vehicleName.trim().toUpperCase() }, { new: true })
            res.status(200).send(changed);
            // console.log(changed);
        }
    }
}

module.exports = { addVehicleType, allVehicles, editVehicleType ,allServices }