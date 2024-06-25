const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const fs = require('fs');
const path = require('path');
const { error, log } = require('console');
require('dotenv').config();
const { fetchKeys } = require('../utils/fetchKeys');

let stripe = null;

const initializeStripe = async () => {
    try {
        let publickey = await fetchKeys('stripe');
        stripe = require('stripe')(publickey);

    } catch (e) {
        console.log('error in initializeStripe', e);
    }

}


const userSchema = new Schema({
    userName: {
        type: String,
        required: true
    },
    userProfile: {
        type: String,
        required: true,

    },
    userEmail: {
        type: String,
        required: true,
        unique: true,
    },
    countryCallingCode: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'countries',
        required: true,
    },
    userPhone: {
        type: String,
        required: true,
        // unique: true,
    },
    stripCustomerId: {
        type: String,
        // required: true,
        unique: true,
    }
});

const User = mongoose.model('User', userSchema);

const addUser = async (req, res) => {
    try {
        console.log('add User req.body ---->>', req.body);
        await initializeStripe();
        if (req.body) {

            let existingCCAndP = await User.findOne({ $and: [{ countryCallingCode: req.body.countryCallingCode }, { userPhone: req.body.userPhone }] });

            console.log('existingCCAndP',existingCCAndP);
            if (existingCCAndP) {
                let errorMessage = '';
                errorMessage = 'Phone number already exists!';
                deleteUploadedFile(req.file.filename);
                return res.status(400).json({ error: errorMessage });
            }

            let countryId = new mongoose.Types.ObjectId(req.body.countryCallingCode)
            let newUser = {
                userProfile: req.file.filename,
                userName: req.body.userName,
                userEmail: req.body.userEmail,
                countryCallingCode: countryId,
                userPhone: req.body.userPhone,
                stripCustomerId: ''
            }

            let addedUser = await User.create(newUser);

            if (addedUser) {

                let stripCustomer = {
                    name: req.body.userName,
                    email: req.body.userEmail,
                    phone: req.body.userPhone,
                    metadata: {
                        customerType: 'User'
                    }
                }

                stripe.customers.create(stripCustomer, async (err, customer) => {
                    if (err) {
                        console.log("Some Error Occured" + err);
                    }
                    if (customer) {
                        console.log(customer);
                        let stripCustomerId = customer.id;
                        let updatedUser = await User.findByIdAndUpdate(addedUser._id, { stripCustomerId: stripCustomerId }).populate('countryCallingCode')
                        console.log('done');
                        return res.status(200).send(updatedUser, { message: 'added successfully' });
                    }
                    else {
                        console.log("Unknown Error");
                    }
                })
            }
            // console.log('done');
            // return res.status(200).send(addedUser, { message: 'added successfully' });
        } else {
            return res.status(400).json({ error: 'Request body not found' });
        }
        // console.log(req.body);
        // return res.status(400).send({ message: 'Some Error Occured' });

    } catch (e) {
        console.log(e);
        if (e.code === 11000) {
            // console.log('inside catch bloakc');
            // console.log(req.file.filename);
            const field = Object.keys(e.keyValue)[0];
            // console.log('inside catch bloakc');
            let errorMessage = '';
            if (field === 'userEmail') {
                errorMessage = 'Email already exists!';
                // console.log(userProfilePath);
                deleteUploadedFile(req.file.filename);
            }
            // else if (field === 'userPhone') {
            //     errorMessage = 'Phone number already exists!';
            //     deleteUploadedFile(req.file.filename);
            // }
            return res.status(400).json({ error: errorMessage });
        }
        console.log('Error:', e);
        return res.status(500).json({ error: 'Failed to add user' });
    }
}

function deleteUploadedFile(fileName) {
    if (!fileName) return;
    let profilePath = path.join(__dirname, '../public/userProfile', fileName);
    fs.unlink(profilePath, (error) => {
        if (error) {
            console.error('Error occurred while deleting image file', error);
        } else {
            console.log('Image file deleted successfully');
        }
    });
}


const getUser = async (req, res) => {
    try {
        console.log('inside getUser---------------', req.body);
        const page = req.body.page || 1; // Parse the page number from the query parameter, defaulting to 1 if it's not present
        const limit = 2; // Set the number of documents to return per page
        let sort; // Parse the sort direction from the query parameter, defaulting to ascending
        let sortStuff
        if (req.body.sort !== 'none') {
            // sort = req.body.sort; // Parse the sort direction from the query parameter, defaulting to ascending
            const sortT = req.body.sort
            sortStuff = { [sortT]: 1 }
        } else {
            sort = null
        }

        let totalUsers // Get the total number of documents in the collection

        let Users;
        const searchTerm = req.body.searchTerm;

        let query = {};

        // if (req.body.searchTerm) {
        //     const sortT = req.body.searchTerm
        //     sortStuff = { [sortT]: 1 }
        // }

        // If searchTerm exists, add conditions to search for userName or userEmail
        if (searchTerm) {
            query = {
                $or: [
                    { userName: { $regex: new RegExp(searchTerm, 'i') } },
                    { userEmail: { $regex: new RegExp(searchTerm, 'i') } },
                    { userPhone: { $regex: new RegExp(searchTerm, 'i') } },
                    //  { _id: searchTerm.toLowerCase()}
                ]
            };
        }



        const aggregateQuery = [
            { $match: query },
            // { $sort: sortStuff }, 
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
                $lookup: {
                    from: 'countries',
                    localField: 'countryCallingCode',
                    foreignField: '_id',
                    as: 'countryCallingCode'
                }
            },
            {
                $unwind: '$countryCallingCode'
            }
        ];


        // console.log('--here-----', sortStuff);
        if (sort !== null) {
            // console.log();
            aggregateQuery.unshift({ $sort: sortStuff });
        }

        Users = await User.aggregate(aggregateQuery).collation({ locale: 'en', strength: 2 });

        // }



        if (searchTerm) {
            totalUsers = await User.countDocuments(query);
        } else {
            totalUsers = await User.countDocuments();
        }
        if (Users.length === 0) {
            return res.status(400).json({ Message: 'No users found' });
        }

        console.log('inside getUser--------------->', Users);

        res.statusMessage = 'user mali gya'
        return res.status(200).json({ totalUsers: totalUsers, users: Users });
    } catch (e) {
        console.log('Error fetching users:', e);
        return res.status(500).json({ error: 'Failed to fetch users' });
    }
}

const updateUser = async (req, res) => {
    try {

        const { id } = req.body
        console.log('update User req.body ---->>', req.body);
        let existingCCAndP = await User.findOne({ $and: [{ countryCallingCode: req.body.countryCallingCode }, { userPhone: req.body.userPhone }, { _id: { $ne: id } }] });

        console.log('existing CCAndP------------>>', existingCCAndP);
        if (existingCCAndP) {
            let errorMessage = '';
            errorMessage = 'Phone number already exists!';
            if (req.file) {
                deleteUploadedFile(req.file.filename);
            }
            return res.status(400).json({ error: errorMessage });
        }

        let userProfile = req.file ? req.file : undefined
        if (userProfile) {
            // let oldFileName = await User.findById(id, { userProfile: true , _id:false }).userProfile;
            let oldFileNameObj = await User.findById(id, { userProfile: true, _id: false });
            let oldFileName = oldFileNameObj.userProfile;
            let updatedUser = await User.findByIdAndUpdate(id,
                {
                    userName: req.body.userName,
                    userEmail: req.body.userEmail,
                    userPhone: req.body.userPhone,
                    userProfile: req.file.filename
                },
                { new: true })
                .populate('countryCallingCode');

            deleteUploadedFile(oldFileName)
            return res.status(200).send(updatedUser);
        } else {
            let updatedUser = await User.findByIdAndUpdate(id,
                {
                    userName: req.body.userName,
                    userEmail: req.body.userEmail,
                    userPhone: req.body.userPhone
                },
                { new: true })
                .populate('countryCallingCode');

            return res.status(200).send(updatedUser);
        }
    } catch (e) {
        console.log('yoooo------- error', e);
        if (e.code === 11000) {
            const field = Object.keys(e.keyValue)[0];
            let errorMessage = '';

            if (field === 'userEmail') {
                errorMessage = 'Email already exists!';
                if (req.file) {
                    deleteUploadedFile(req.file.filename);
                }
            }
            return res.status(400).json({ error: errorMessage });
        }
        console.log('Error:', e);
        return res.status(500).json({ error: 'Failed to update user' });
    }

}

const deleteUser = async (req, res) => {
    try {

        console.log('inside the delete user ' , req.body);
        await initializeStripe();
        let stripCustomer = await User.findById(req.body.id, { _id: false, stripCustomerId: true });
        let stripCustomerId = stripCustomer.stripCustomerId
        console.log(stripCustomerId);


        const deletedUser = await User.findByIdAndDelete(req.body.id);
        if (!deletedUser) {
            console.log('User not found.');
            return;
        }
        let fileName = deletedUser.userProfile;
        if (!fileName) {
            console.log('Profile image not found for the user.');
            return res.status(404).json({ message: 'Profile image not found for the user' });
        } else {
            deleteUploadedFile(fileName);
        }

        if (deleteUser) {
            let deleted = await stripe.customers.del(stripCustomerId);
            console.log(deleted);
        }


        console.log('User deleted successfully:', deletedUser);
        return res.status(200).json(deletedUser, { message: 'User deleted successfully' })
    } catch (e) {
        console.log('Error fetching User:', e);
        return res.status(500).json({ error: 'Failed to fetch vehicles' });
    }
}

const getCards = async (req, res) => {
    try {

        await initializeStripe();
        console.log(req.body);
        let cardsToSend = [];
        let defaultCardId


        await stripe.customers.retrieve(req.body.stripClientId, (err, customer) => {
            if (err) {
                console.log('err');
            }
            if (customer) {
                defaultCardId = customer.default_source;
                // defaultCardId = customer.invoice_settings.default_payment_method;
                console.log(customer);
                console.log(defaultCardId);
            }
        })
        // console.log('hellow'+customer);


        const cards = await stripe.paymentMethods.list({
            customer: req.body.stripClientId,
            type: 'card'
        });
        cards.data.forEach(card => {
            let details = {
                cardId: card.id,
                brand: card.card.brand,
                country: card.card.country,
                last4: card.card.last4,
                exp_month: card.card.exp_month,
                exp_year: card.card.exp_year,

            };

            cardsToSend.push(details);
        });

        // console.log(cards.data);
        // console.log(cardsToSend);
        // Return the list of cards in the response
        let response = {
            cards: cardsToSend,
            defaultCardId: defaultCardId
        }
        return res.status(200).json(response);
        // return res.status(200).json({ cards: cards.data });
    } catch (error) {
        console.log('Error fetching cards:', error);
        return res.status(500).json({ error: 'Failed to fetch cards' });
    }
}


const addCard = async (req, res) => {
    try {
        console.log(req.body);
        await initializeStripe();

        stripe.customers.createSource(req.body.stripClientId, { source: req.body.token }, (err, cardResponse) => {
            if (err) {
                console.log('some error occured', err);
                return res.status(400).json({ message: 'Enable to add Card' });
            }
            if (cardResponse) {
                // console.log(card);
                console.log('card Added successfully');
                card = {
                    cardId: cardResponse.id,
                    brand: cardResponse.brand,
                    country: cardResponse.country,
                    last4: cardResponse.last4,
                    exp_month: cardResponse.exp_month,
                    exp_year: cardResponse.exp_year,
                };
                return res.status(200).json(card);
            }
            else {
                console.log('unknown error');
            }
        })

        //    console.log('successfully:');
        //     return res.status(200).json({ message: 'got here' });
    } catch (e) {
        console.log('Error Occured:', e);
        return res.status(500).json({ error: 'Failed to add card' });
    }
}

const setDefaultCard = async (req, res) => {
    try {
        await initializeStripe();
        console.log(req.body);
        if (req.body) {
            const { customerId, cardId } = req.body;
            stripe.customers.update(customerId, {
                // invoice_settings: {
                //     // default_payment_method: cardId
                // }
                default_source: cardId

            }, (err, customer) => {
                if (err) {
                    console.log("some error occured", err);
                }
                if (customer) {
                    console.log(customer);
                    return res.status(200).json({ message: 'set defauld' });
                } else {
                    console.log('wtf');
                }
            })
        }
        // console.log('successfully:');
        // return res.status(400).json({ message: 'Some Error Occured' });
    } catch (e) {
        console.log('Error occured:', e);
        return res.status(500).json({ error: 'Failed to set default' });
    }
}

const deleteCard = async (req, res) => {
    try {
        await initializeStripe();
        console.log(req.body);
        if (req.body) {
            const { customerId, cardId } = req.body;
            stripe.customers.deleteSource(customerId, cardId, (err, card) => {
                if (err) {
                    console.log("some error occured", err);
                }
                if (card) {
                    console.log(card);
                    return res.status(200).json(card);
                } else {
                    console.log('wtf');
                }
            })
        }
    } catch (e) {
        if (error.type === 'StripeCardError') {
            console.error('Stripe Card Error:', error.message);
            return res.status(500).json({ error: 'Stripe Card Error' });
        } else {
            console.error('An error occurred while deleting the card:', error.message);
            return res.status(500).json({ error: 'An error occurred while deleting the card' });
        }

    }
}

const getSinglUser = async (req, res) => {
    try {
        await initializeStripe();
        console.log('inside the getSinglUser of userController ===>', req.body);
        if (req.body) {
            const { countryCC, userPhone } = req.body;
            let user = await User.findOne({ userPhone: userPhone, countryCallingCode: new mongoose.Types.ObjectId(countryCC) }, { userProfile: 0, __v: 0 });
            console.log(user);
            if (user) {
                const cards = await stripe.paymentMethods.list({
                    customer: user.stripCustomerId,
                    type: 'card'
                });

                let response = {
                    status: 'success',
                    cardArray: cards.data,
                    user: user
                }

                console.log('cards----->', cards);

                return res.status(200).json(response);
            }
            let response = {
                status: 'No user found',
                user: null,
                cardArray: cards
            }
            return res.status(400).json(response)
        }
    } catch (e) {
        if (error.type === 'StripeCardError') {
            console.error('Stripe Card Error:', error.message);
            return res.status(500).json({ error: 'Stripe Card Error' });
        } else {
            console.error('An error occurred while deleting the card:', error.message);
            return res.status(500).json({ error: 'An error occurred while deleting the card' });
        }
        // return res.status(500).json({ error: 'An error occurred while deleting the card' });

    }
}





module.exports = { User, addUser, getUser, updateUser, deleteUser, addCard, getCards, setDefaultCard, deleteCard, getSinglUser }