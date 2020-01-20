var express = require('express');
var router = express.Router();
var userModel = require("../models/user");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");
var util = require('../helpers/helper');
var config = require('config');

router.get("/", function (req, res) {
    res.render("forgot-pass", {
        title: "forgot-pass",
        layout: false
    });
})
router.post('/', function (req, res, next) {
    async.waterfall([
        function (done) {
            crypto.randomBytes(20, function (err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function (token, done) {
            userModel.findOneByEmail(req.body.email).then(user => {
                if (!user) {
                    req.flash('error', 'No account with that email address exists.');
                    return res.redirect('/forgot-pass');
                }
                user.reset_token = token;
                user.expries_token = util.UpdatePostDate(Date.now() + 3600000); // 1 hour
                userModel.update(user).then((err) => {
                    done(err, token, user);
                }).catch();
            }).catch(err => {
                console.log(err);
            });
        },
        function (token, user, done) {
            console.log(token);
            console.log(user);
            var smtpTransport = nodemailer.createTransport({
                service: 'gmail',
                secure: false,
                port: 25,
                auth: {
                    user: config.get('auth.user'),
                    pass: config.get('auth.pass')                  
                },
            });
            var mailOptions = {
                to: user.email,
                from: 'nguyenquangtrieu02071998@gmail.com',
                subject: 'Node.js Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + req.headers.host + '/reset-pass/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            smtpTransport.sendMail(mailOptions, function (err) {
                console.log('mail sent');
                req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                done(err, 'done');
            });
        }
    ], function (err) {
        if (err) return next(err);
        res.redirect('/forgot-pass');
    });
});
module.exports = router