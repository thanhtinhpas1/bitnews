var express = require('express');
var router = express.Router();
var userModel = require("../models/user");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");
var util = require('../helpers/helper');
var config = require('config');

router.get('/:token', function (req, res) {
    console.log('token:' + req.params.token);
    console.log(Date.now());
    var user = userModel.findOneByToken(req.params.token);
    user.then(rows => {
        if (!rows) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot-pass');
        }
        var datenow = util.ConvertToMilliSecond(util.UpdatePostDate(Date.now()));
        var date_expries = util.ConvertToMilliSecond(util.UpdatePostDate(rows.expries_token));
        var subs = date_expries - datenow;
        if (subs < 0) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot-pass');
        }
        res.render("reset-pass", {
            title: "reset-pass",
            layout: false,
            token: req.params.token
        });
    }).catch(err =>{
        req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect('/forgot-pass');
    });
});
router.post('/:token', function (req, res) {
    async.waterfall([
        function (done) {
            var user = userModel.findOneByToken(req.params.token);
            user.then(user => {
                if (!user) {
                    req.flash('error', 'Password reset token is invalid or has expired.');
                    return res.redirect('back');
                }
                console.log(user);
                var datenow = util.ConvertToMilliSecond(util.UpdatePostDate(Date.now()));
                var date_expries = util.ConvertToMilliSecond(util.UpdatePostDate(user.expries_token));
                var subs = date_expries - datenow;
                if (subs < 0) {
                    req.flash('error', 'Password reset token is invalid or has expired.');
                    return res.redirect('/forgot-pass');
                }
                if (req.body.password === req.body.confirm) {
                    user.password =  util.hash_password(req.body.password);
                    user.reset_token = undefined;
                    user.expries_token = undefined;
                    userModel.update(user).then(err => {
                        done(err, user);
                    }).catch(err => {
                        console.log(err);
                        return res.redirect('/forgot-pass');
                    })
                } else {
                    console.log(err);
                    req.flash("error", "Passwords do not match.");
                    return res.redirect('back');
                }
            }).catch(err => {
                console.log(err);
                return res.redirect('/forgot-pass');
            });
        },
        function (user, done) {
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
                from: 'nguyenquangtrieu02071998@mail.com',
                subject: 'Your password has been changed',
                text: 'Hello,\n\n' +
                    'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            };
            smtpTransport.sendMail(mailOptions, function (err) {
                req.flash('success', 'Success! Your password has been changed.');
                done(err);
            });
        }
    ], function (err) {
        res.redirect('/login');
    });
});

module.exports = router;
