const mongoose = require('mongoose');
const { Schema} = require('mongoose');
// const validator = require('validator');
const JWT = require('jsonwebtoken');
// const secretKey = 'this is secreate';
// require('dotenv').config();
const secretKey = process.env.SECRET_VARIABLE;

const bcrypt = require('bcrypt');

const adminSchema = new Schema({
    userName: {
        type: String,
        max: 25,
        required: true
    },
    password: {
        type: String,
        required: true,
        // max: 30
    }
});
const Admin = mongoose.model('Admin', adminSchema);


// mongoose.connect('mongodb://127.0.0.1:27017/Product')
//     .then(() => console.log('connection is successfull...'))
//     .catch((error) => console.log(error));

const token = async (req, res) => {
    try {

        console.log(req.body);
        const { username, password } = req.body;
        // console.log('here is the bcrypted password----->>', await bcrypt.hash(req.body.password, 8));
        console.log('here is the bcrypted password----->>', await bcrypt.compare(password, '$2b$08$eAqC8q2sCoxLs0E3BCI19ewcJo030aOiq8.NyWYV3bvzKH/NhPiXm'));


        if (!username || !password) {
            return res.status(400).json({ message: 'Please provide username and password' });
        }


        const dbUser = await Admin.findOne({ userName: username }); // Find user by username
        if (!dbUser) {
            return res.status(401).json({ message: 'No admin Found' });
        }
        let presentOrNot = await bcrypt.compare(password, dbUser.password);
        if (!presentOrNot) {
            // console.log('-----------------------------------------------');
            return res.status(401).json({ message: 'Invalid Password' });
        }
        // Check if password matches
        // if (password !== dbUser.password) {
        //     return res.status(401).json({ message: 'Invalid credentials' });
        // }
        if (await bcrypt.compare(password, dbUser.password) && dbUser) {
            let payload = { id: dbUser._id.toString() }
            console.log('insideSd true');
            console.log(secretKey);
            JWT.sign(payload, secretKey, { expiresIn: '5h' }, (error, token) => {
                if (error) {
                    return res.status(500).json({ message: 'Internal server error' });
                }
                console.log('insideSd true');
                return res.status(200).json({ token });
                // console.log('insideSd true');
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(401).json({ message: 'Some error occured' });
    }
}

module.exports = { token, Admin };