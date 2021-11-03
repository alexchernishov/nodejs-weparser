const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const validateLoginInput = require('../validation/login');

const User = require('../models/User');



router.post('/login', (req, res) => {

    const { errors, isValid } = validateLoginInput(req.body);

    if(!isValid) {
        return res.status(400).json(errors);
    }

    const email = req.body.email;
    const password = req.body.password;
    User.getByEmail(email,function (error,user) {
        if(!user) {
            errors.email = 'User not found';
            return res.status(404).json(errors);
        }

        passport.authenticate('jwt', {session: false}, (err) => {
            bcrypt.compare(password, user[0].password)
                .then(isMatch => {
                    if(isMatch) {
                        const payload = {
                            id: user[0].id,
                            name: user[0].username
                        }
                        jwt.sign(payload, 'secret', {
                            expiresIn: 3600
                        }, (err, token) => {
                            if(err) console.error('There is some error in token', err);
                            else {
                                res.json({
                                    success: true,
                                    token: `Bearer ${token}`
                                });
                            }
                        });
                    }
                    else {
                        errors.password = 'Incorrect Password';
                        return res.status(400).json(errors);
                    }
                });
        })
        (req, res);

    });


});

router.get('/',  passport.authenticate('jwt', { session: false }),(req, res) => {

    User.getUserById(1,function (error,user) {
        return res.json(user);
    });

});

module.exports = router;