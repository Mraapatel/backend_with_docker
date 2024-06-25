
const secreat_strip_key = process.env.STRIP_SECREATE_KEY
const stripe = require('stripe')(secreat_strip_key);


const addFunds = async (req, res) => {
    try {
        console.log('inside the add funds method');
        const charge = await stripe.charges.create({
            amount: 999999, // Amount in cents ($50.00)
            currency: 'usd',
            source: "tok_1PM6OWRvggPBSsNZgKM4b4gs"
        });

        console.log('fund added to the stripe account', charge);
        return res.status(200).json({ message: 'The Funds Added Sucessfull' })

    } catch (e) {
        console.log('Error occured while adding funds in stripe', e);
        return res.status(200).json({ message: 'yooo error' });
    }
}

module.exports = { addFunds }