const uniqid = require('uniqid');
const bcrypt = require('bcrypt');




const db = require('../utilities/database.js');

const passport = require('passport');
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const localStrategy = require('passport-local').Strategy;


const SALT = 8;
const secret = process.env.JWT_SECRET;



passport.use(
    'register',
    new localStrategy(
        {
            usernameField: 'email',
            passwordField: 'password',
            session: false
        },
        async (email, password, done) => {
            try {
                const [[user]] = await db.execute('SELECT `email`,`id` FROM `users` WHERE `email`=(?) LIMIT 1' ,[email]);
                if (user) return done(null, false, {message: "That email is already taken."});
                var hashedPass = await bcrypt.hash(password, SALT);
      
                let create = await db.execute('INSERT INTO `users` (`id`, `email`, `password`) VALUES (?,?,?)' , [uniqid() , email, hashedPass]);

                const [[newUser]] = await db.execute('SELECT `email`,`id` FROM `users` WHERE `email`=(?) LIMIT 1' ,[email]);
                return done(null, newUser);
            } catch(e) {
                done(e)
            }
        }
    )
)

passport.use(
    'login',
    new localStrategy(
        {
            usernameField: 'email',
            passwordField: 'password',
            session: false
        },
        async (email, password, done) => {
            try {
            
                const [[user]] = await db.execute('SELECT `email`,`id`, `password`, name , profile_picture_key FROM `users` WHERE `email`=(?) AND `status` = ? LIMIT 1' ,[email, "CONFIRMED"]);

                if(!user) return done(null, false, {message: "Wrong Credentials"});

                var match = await bcrypt.compare(password, user.password);
                if(match) {
                    return done(null,user);
                } else {
                    return done(null, false, {message: "Wrong Credentials"});
                }

            } catch(e) {
                done(e);
            }
        }
    )
)

passport.use(
    'change-password',
    new localStrategy(
        {
            usernameField: 'email',
            passwordField: 'password',
            session: false
        },
        async (email, password, done) => {
            try {
            
                const [[user]] = await db.execute('SELECT `email`, `password` FROM `users` WHERE `email`=(?) LIMIT 1' ,[email]);

                if(!user) return done(null, false, {message: "Wrong Credentials"});

                var match = await bcrypt.compare(password, user.password);
                if(match) {
                    return done(null,user);
                } else {
                    return done(null, false, {message: "Wrong Credentials"});
                }

            } catch(e) {
                done(e);
            }
        }
    )
)


passport.use(
    'otpAuth',
    new localStrategy(
        {
            usernameField: 'email',
            passwordField: 'otp',
            session: false
        },
        async (email, otp, done) => {

            try {
                const [[user]] = await db.execute('SELECT `email`,`id`, `otp`, `name`, `profile_picture_key` FROM `users` WHERE `email`=(?) LIMIT 1' ,[email]);
                console.log(user);

                if(!user) return done(null, false, {message: "Wrong Credentials"});

                if(otp == user.otp) {
                    return done(null,user);
                } else {
                    return done(null, false, {message: "Wrong Credentials"});
                }

            } catch(e) {
                done(e);
            }
        }
    )
)

var customExtractor = function(req) {
    var token = headerExtactor(req);  
    return token;
};

var headerExtactor = function (req) {
    return req.headers['authorization'].split(' ')[1]
} 

const opts = {
    // jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
    jwtFromRequest: ExtractJwt.fromExtractors([customExtractor]),
    secretOrKey: secret,
    ignoreExpiration: true,
    passReqToCallback: true,
    
}


passport.use(
    'jwt',
    new JWTStrategy(opts, async (req,jwt_payload,done) => {
       let {exp, id} = jwt_payload; 

        try {
            let [[user]] = await db.execute('SELECT * FROM `users` WHERE `id`= ? LIMIT 1', [id])
            req.user = user;
            if (user.id) {
                if (exp > Date.now()) {
                    console.log("EXPIRED");
                }
                done(null, user);
            } else {
                console.log(null, false, {message: "User not found"})
            }
        } catch(e) {
            console.log(e);
            done(e)
        }
    })
)





