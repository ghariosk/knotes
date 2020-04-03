const passport = require('passport');

const sendEmail = require('../utilities/smtp');

const db = require('../utilities/database');
const User = require('../models/User');

const secret = process.env.JWT_SECRET;
const jwt = require('jsonwebtoken');



const  uniqid = require('uniqid');
const bcrypt = require('bcrypt');

const SALT = 8;





function twoDigits(d) {
    if(0 <= d && d < 10) return "0" + d.toString();
    if(-10 < d && d < 0) return "-0" + (-1*d).toString();
    return d.toString();
}

// gets the date in a year in mysql timestamp format
Date.prototype.inASqlYear = function() {

    return (this.getUTCFullYear() + 1) + "-" + twoDigits(1 + this.getUTCMonth()) + "-" + twoDigits(this.getUTCDate()) + " " + twoDigits(this.getUTCHours()) + ":" + twoDigits(this.getUTCMinutes()) + ":" + twoDigits(this.getUTCSeconds());
};

// gets the date in mysql timestamp format
Date.prototype.inSql = function() {
    return (this.getUTCFullYear() + 1) + "-" + twoDigits(1 + this.getUTCMonth()) + "-" + twoDigits(this.getUTCDate()) + " " + twoDigits(this.getUTCHours()) + ":" + twoDigits(this.getUTCMinutes()) + ":" + twoDigits(this.getUTCSeconds());
};


  

async function registerUser(req,res,next) {

    passport.authenticate('register' , (err, user, info) => {
        req.user = user;
        if(err) {
            console.log(err);
            res.status(500).send({message: "There was an error" , error: err})
        }
        if (info != undefined) {
            res.status(422).send({...info, status:422}
            );
        } else {
            next()
        }
    })(req, res, next);
}

async function sendConfirmationEmail(req,res) {

    var OTP = uniqid();

    try {
        let email;
        // Check whether the confirmation email is requested directly after sign up or on demand from the user.
        if(req.user) {
            email = req.user.email
            db.execute('UPDATE `users` SET `otp`= ?, `status`= ?, `name` = ? WHERE `id` = ?' , [OTP, 'UNCONFIRMED',req.body.name, req.user.id])
            sendEmail(email, "Your Confirmation Code", `Your confirmation code is ${OTP} and your username is ${email}`);
            res.status(201).send({status: 201, message: "Success"})
        } else if (req.body.email) {
            email = req.body.email
            db.execute('UPDATE `users` SET `otp`= ? WHERE `email` = ? AND `status` = ?' , [OTP, req.body.email,'UNCONFIRMED']);
            sendEmail(email, "Your Confirmation Code", `Your confirmation code is ${OTP} and your username is ${email}`);
            console.log("HERE");
            res.status(201).send({status: 201, message: "Success"})
        } else {
            console.log(req.body.email)
            return res.status(500).send({status: 500,message: "Missing email"})
        }

    } catch(e) {
        console.log(e);
        res.status(500).send({
            status: 500,
            message: "RESEND CONFIMRATION",
            email: req.user.email,
            status: "UNCONFIRMED"

        })
    }
   
}

async function confirmUser(req,res) {
    var {email} = req.body;

    try {
        let [[{otp}]] = await db.execute("SELECT `otp` FROM `users` WHERE `email` = ? ", [email]);
        if (!otp) return res.status(404).send({message: "No user for that email"});
        let verifiedDate = new Date();
        let formattedVerifiedDate = (verifiedDate).inSql();
        console.log(otp, req.body.otp);
        if (req.body.otp == otp) {
            await db.execute("UPDATE `users` SET `otp` = ? , `verified_at`=?, `status`=? WHERE `email` = ?", [null,formattedVerifiedDate, "CONFIRMED", email ])
            res.status(201).send({ status: 201, message: "Success"})
        } else {
            res.status(404).send({message: "The confirmation code provided is invalid"})
        }

    } catch(e) {
        console.log(e);
        res.status(500).send({message: "Server Error"});
    }

}

async function forgottenPassword(req,res) {
    var {email} = req.body;
    try {
        console.log("HERE");
        let OTP = uniqid();
        await db.execute("UPDATE `users` SET `otp` =? WHERE `email` = ?", [OTP, email]);

        sendEmail(email, "Your Temporary Password", `Your is temporary password is ${OTP} and your username is ${email}`);
        res.status(201).send({message: "Success", status: 201});
    } catch(e) {
        console.log(e)
        res.status(500).send({message: "Error"})
    }
}

async function oneTimePasswordLogin(req,res, next) {
    passport.authenticate('otpAuth' , async (err, user, info) => {
        if(err) {
            console.log(err);
            res.status(500).send({message: "There was an error"})
        }
        if (info != undefined) {
            console.log(info.message);
            res.status(200).send({message: info.message});
        } else {
            let [token , expiry] = await generateJwt(user.id);
            req.token = token;
            req.token_expiry = expiry
            req.user = user;
            next();      
        }
    })(req, res, next);
}

async function removeOtp(req,res,next) {
    let email = req.user.email;
    try {
        await db.execute("UPDATE `users` SET `otp` = ?, `status` = ? WHERE `email` = ? ", [null,"FORCE_CHANGE_PASSWORD", email])
        next()

    } catch(e) {
        console.log(e);
        res.status(500).send({message: "Error", error: e})
    }
}

async function generateJwt(id) {
    // Set the jwt expiry to a week. token expiry will not be checked for in the development env
    let expiry = 1000*60*60*24*7;
    let params = {
        id: id,
        exp: expiry
    }
    return new Promise((resolve,reject) => {
        let token = jwt.sign(params, secret);
        if(token) {
            resolve([token,expiry]);
        } else {
            reject()
        }     
    }) 

}

async function forceChangePassword(req,res) {
   
    let {password} = req.body;
    let {email} = req.user;

    try {
        
        let [[user]] = await db.execute("SELECT email FROM `users` WHERE `email` = ? AND `status` = ?", [email, "FORCE_CHANGE_PASSWORD"]);
        if (!user) return res.status(404).send({status: 404, message: "Not Found"});
        var hashedPass = await bcrypt.hash(password, SALT);
        await db.execute('UPDATE `users` SET `password` = ?, `status` = ? WHERE `email` = ?'  , [ hashedPass, "CONFIRMED", email]);
        res.status(201).send({status: 201, message: "Success"})
    } catch(e) {
        console.log(e);
        res.status(500).send({message: "Error", error: e});
        
    }
}

async function loginUser(req,res,next) {
    passport.authenticate('login' , async (err, user, info) => {
        if(err) {
            console.log(err);
            res.status(500).send({message: "There was an error"})
        }
        if (info != undefined) {
            console.log(info.message);
            res.status(200).send({message: info.message});
        } else {
            let [token,expiry] =  await generateJwt(user.id);
            req.token = token;
            req.token_expiry = expiry;
            req.user = user;
            next();      
        }
    })(req, res, next);
}

async function changePassword(req,res, next) {
    passport.authenticate('change-password' , async (err, user, info) => {
        if(err) {
            console.log(err);
            res.status(500).send({message: "There was an error"})
        }
        if (info != undefined) {
            console.log(info.message);
            res.status(200).send({message: info.message});
        } else {
            let {new_password} = req.body;
            var hashedPass = await bcrypt.hash(new_password, SALT);
            await db.execute('UPDATE `users` SET `password` = ? WHERE `email` = ?'  , [ hashedPass, user.email]);
            res.status(201).send({status: 201, message: "Success"})
        }
    })(req, res, next);
}

async function logOutUser(req,res) {
    var {id }= req.user;
    req.logout();
    res.status(201).send({message: "Success"});
}



async function finishLoginIn (req,res) {
    console.log(req.user);
    res.status(201).send({
        status: 201,
        auth: true,
        jwt: req.token,
        jwt_expo: req.token_expiry,
        email: req.user.email,
        message: "Success",
        name: req.user.name,
        id:  req.user.id,
        profile_picture_key: req.user.profile_picture_key
    })
}

module.exports = {
    changePassword,
    registerUser,
    loginUser,
    finishLoginIn,
    logOutUser,
    sendConfirmationEmail,
    confirmUser,
    forgottenPassword,
    oneTimePasswordLogin,
    removeOtp,
    forceChangePassword
}