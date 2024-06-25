
const nodemailer = require('nodemailer');
const Mailgen = require('mailgen');
const { fetchKeys } = require('./fetchKeys');
require('dotenv').config();

const sendEmail = async (toMail, Name, Ammount, link) => {
    console.log('toMail',toMail);
    console.log('name',Name);
    console.log('ammount',Ammount);
    
    let emailKeys = await fetchKeys('email');
    console.log('password', emailKeys.keyValues.password);
    console.log('email', emailKeys.keyValues.email);
    console.log('EmailKeys in sendemail--->' , emailKeys);

    let config = {
        service: 'gmail',
        auth: {
            user: emailKeys.keyValues.email,
            pass: emailKeys.keyValues.password,
        }
    }
    // Creating a transporter for sending emails using the specified configuration
    let transporter = nodemailer.createTransport(config);

    let mailgenerator = new Mailgen({
        theme: 'default',
        product: {
            name: 'Eber',
            link: 'http://localhost:4200/home/createRide'
        }
    });

    let response = {
        body: {
            name: Name,
            intro: 'Your Ride bill',
            table: {
                data: [{
                    Sr: 1,
                    description: 'Ride Completion Charge',
                    price: `${Ammount} $`
                }]
            },
            action: [
                {
                    instructions: 'Invoice',
                    button: {
                        color: '#22BC66', // Optional: set the color of the button
                        text: 'View Bill',
                        link: 'http://localhost:4200/home/createRide'
                    }
                },
            ],

            outro: 'loking forword For you next Ride'
        }
    }

    let mail = mailgenerator.generate(response);

    let message = {
        from: 'ninjahathodi1015@gmail.com',
        to: toMail,
        subject: 'Ride Completed',
        html: mail
    }

    transporter.sendMail(message).then(() => {
        console.log('Mail send to Customer');
    }).catch(error => {
        console.log('Error while sending the mail to the Customer', error);
    })
}

module.exports = { sendEmail }