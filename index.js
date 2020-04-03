require('dotenv').config('../.env');
let express = require('express');

let passport = require('passport');
let cookieParser = require('cookie-parser');
let session = require('express-session');

let cors = require('cors');


let app = express();
let notesRoutes = require('./routes/notes');
let authRoutes = require('./routes/auth');
let usersRoutes = require('./routes/users');

let cors_params = {
    origin: 'http://localhost:3001',
    exposedHeaders: ['Content-Type', 'Accept', 'Authorization'],
    credentials: true
};

app.use(cors(cors_params))
app.use(express.json());
app.use(cookieParser());

require('./passport/passport');

// app.use(session({ 
//     secret: 'keyboard cat',
//     resave: false,
//     saveUninitialized: true
// }));

// passport.serializeUser(function (user, done) {
//     done(null, user);
// });

// passport.deserializeUser(function (user, done) {
//     done(null, user);
// });
app.use(passport.initialize());
app.use(passport.session());
// app.use(passport.authenticate('remember-me'));
app.use('/auth', authRoutes);
app.use('/users', passport.authenticate('jwt', {session: false}), usersRoutes);

app.use(
    '/notes',
    passport.authenticate('jwt' , {session: false}),
    notesRoutes)
;



let PORT = 3000;
let HOST = "0.0.0.0"

app.listen( PORT , HOST , function () {
    console.log(`App is listening on ${HOST}:${PORT}`)
})