const express = require('express');
// const multer = require('multer')
const routes = express.Router();
const secreat_strip_key = process.env.STRIP_SECREATE_KEY
const stripe = require('stripe')(secreat_strip_key);
// const path = require('path')


const { addFunds } = require('../utils/addFunds');


// routes.post('/addfunds', addFunds);
routes.post("/", async (req, res) => {
    try {

        // ----------------------------------------------------------------
        let sting = '5e7dcf4c17affa9547de69d96dffc6d1'
        let length = sting.length


        // ----------------------------------------------------------------

        //    let data =  await stripe.paymentMethods.retrieve(req.body.defaultSource);
        //    let thereedSecure = data.card.three_d_secure_usage

        // ----------------------------------------------------------------

        // //  Create a PaymentIntent with the order amount and currency
        //  const paymentIntent = await stripe.paymentIntents.create({
        //      amount: 10000,
        //      currency: "usd",
        //     // //   In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
        //      automatic_payment_methods: {
        //          enabled: true,
        //      },
        //  });

        //  res.send({
        //      clientSecret: paymentIntent,
        //  });

        // ----------------------------------------------------------------

        // let deleted = await stripe.accounts.del(req.body.cusotmerId);

        // ----------------------------------------------------------------
        console.log('lendth', length);
        res.send(length)
    } catch (e) {
        console.log(e);
        res.send(e)
    }
});


module.exports = routes