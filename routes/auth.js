let { Router} = require('express')
let passport = require('passport');

let router = Router();


let {
    registerUser,
    loginUser,
    changePassword,
    finishLoginIn,
    logOutUser,
    sendConfirmationEmail,
    confirmUser,
    forgottenPassword,
    oneTimePasswordLogin,
    removeOtp,
    forceChangePassword
} = require('../controllers/auth');


router.post('/register', registerUser, sendConfirmationEmail);

router.post('/login' , loginUser, finishLoginIn);


router.post('/logout', passport.authenticate('jwt' , {session: false}) , logOutUser);


router.post('/forgot', forgottenPassword);

router.post('/confirm', confirmUser)

router.post('/resend-confirmation', sendConfirmationEmail);

router.post('/login/otp', oneTimePasswordLogin, removeOtp, finishLoginIn);

router.post('/otp/change-pass', passport.authenticate('jwt' , {session:false}), forceChangePassword);

router.post('/change-pass', passport.authenticate('jwt', {session: false}), changePassword)

// router.post('/token', )


module.exports = router;