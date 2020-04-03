const nodemailer = require('nodemailer');


let smtpParams = {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
}

let sendEmail = async function (email ,subject, message) {
    let transporter = nodemailer.createTransport(smtpParams);
    let emailParams = {
        from: 'K-Notes <no-reply@waziifa.com>',
        to: email,
        subject: subject,
        text: message
    }
    return new Promise((resolve, reject)=> {
        transporter.sendMail(emailParams, (err, info) => {
           if (err)  {
               console.log(err);
               reject(err)
           } else {
               console.log(info);
               resolve(info)
           }
    
    
        });

    })
   
}


module.exports = sendEmail;