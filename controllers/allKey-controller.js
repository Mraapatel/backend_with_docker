const { allKeyModal } = require('../models/allKeys');

const saveData = async (req, res) => {
    let response = {
        message: '',
        status: 200
    }
    try {
        if (req.body) {

            console.log('inside the savedata allkeys------>',req.body);
            const existingDoc = await allKeyModal.findOne({ objectType: req.body.objectType });
            if (existingDoc) {
                await allKeyModal.findByIdAndUpdate(existingDoc._id, { keyValues: req.body.values }, { new: true })
                response.message = 'Data updated successfully'
                console.log('existing object======>', existingDoc);
                return res.json(response)
            } else {
                let obj = {
                    objectType: req.body.objectType,
                    keyValues: req.body.values
                }

                allKeyModal.create(obj)
                response.message = 'Data saved successfully';
                return res.json(response);
            }
        }
        response.status = 404;
        response.message = 'No request body found';
        return res.json(response)
    } catch (e) {
        console.log('Error happend in saveEmailKeys', e);
        response.status = 500;
        response.message = 'Some Error Occured at server side ';
        return res.json(response)
    }

}



const getKeys = async (req, res) => {
    let response = {
        message: '',
        status: 200,
        data: null
    }
    try {
        const existingDocs = await allKeyModal.aggregate([
            {
                $project: {
                    __v: 0,
                    _id: 0
                }
            }
        ]);
        if (existingDocs) {

            console.log('fetched data');
            response.message = 'data found';
            response.data = existingDocs
            return res.status(200).json(response)
        }
        response.status = 404;
        response.message = 'data not found';
        response.data = null
        return res.status(404).json(response)

    } catch (e) {
        console.log('Error happend in saveEmailKeys', e);
        response.status = 500;
        response.message = 'Some Error Occured at server side ';
        return res.status(500).json(response)
    }

}

module.exports = { saveData, getKeys }