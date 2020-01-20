var express = require('express');
var router = express.Router();
var passport = require('passport');
var userModel = require('../models/user');

router.get("", function (req, res) {
    console.log(req);
    var message = "You must login to view preimum post!";
    if (req.query.premium == 1) {
        res.render("login", { layout: false , message: message});
    }
    else res.render("login", { layout: false });
});

router.post('/', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err)
            return next(err);
        if (!user) {
            return res.render('login', {
                layout: false,
                err_message: info.message
            })
        }

        req.logIn(user, err => {
            if (err) return next(err);
            var redirectTo = req.session.redirectTo;
            if (!redirectTo) {
                switch (user.role_id) {
                    case 1:
                        redirectTo = '/';
                        break;
                    case 2:
                        redirectTo = '/';
                        break;
                    case 3:
                        redirectTo = '/writer';
                        break;
                    case 4:
                        redirectTo = '/editor';
                        break;
                    case 5:
                        redirectTo = '/admin';
                        break;
                }
            }
            delete req.session.redirectTo;
            return res.redirect(redirectTo);
        });
    })(req, res, next);
})

module.exports = router;