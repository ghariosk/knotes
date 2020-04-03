let nodemailer = require('nodemailer');
//  let AWS = require('aws-sdk');


// // create Nodemailer SES transporter
// let transporter = nodemailer.createTransport({
//     SES: new AWS.SES({
//         apiVersion: '2010-12-01',
//         region : 'eu-west-1'
//     })
// });

// // send some mail
// transporter.sendMail({
// from: 'contact@waziifa.com',
// to: 'karlgharios@hotmail.com',
// subject: 'Message',
// text: 'I hope this message gets sent!'
// }, (err, info) => {
// console.log(err);
// console.log(info);
// });

const mailOptions = {
    from: "No Reply <no-reply@waziifa.com>",
    to: 'karlgharios@hotmail.com',
    subject: ``,
    html: "Hello"
};

const transporter = nodemailer.createTransport({
    host: 'smtp.zoho.eu',
    port: 587,
    auth: {
        user: "karl.gharios@waziifa.com",
        pass: "jesuisla45"
    }
});

transporter.sendMail(mailOptions)