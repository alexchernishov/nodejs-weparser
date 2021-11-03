// passport.js

const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const User =require('../models/User');
const opts = {};
const LocalStrategy = require('passport-local').Strategy;

opts.jwtFromRequest = ExtractJWT.fromAuthHeaderAsBearerToken();
opts.secretOrKey = 'secret';


module.exports = passport => {
    passport.use(new JWTStrategy(opts, (jwt_payload, done) => {
        User.getUserById(jwt_payload.id, function (error,user) {
            if(error){
                console.error(error)
            }
            if(user) {
                return done(null, user);
            }
            return done(null, false);
        })
    }));




}