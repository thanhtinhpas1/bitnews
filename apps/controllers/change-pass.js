var express = require('express');
var router = express.Router();
var userModel = require("../models/user");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");
var util = require('../helpers/helper');

router.get("/:id", function (req, res) {
    res.render("change-pass", { title: "change-pass", layout: false, id: req.params.id });
});
router.post('/:id', function (req, res, next) {
    var user = userModel.findById(req.params.id);
    user.then(user => {
        if (!user) {
            req.flash('error', 'User not exist.');
            return res.redirect('back');
        }
        if (req.body.password != user.password) {
            req.flash('error', 'Old password not exist');
            return res.redirect('back');
        }
        if (req.body.newpassword != req.body.confirm) {
            req.flash('error', 'New password or confirm password not the same');
            return res.redirect('back');
        }
        user.password = req.body.newpassword;
        userModel.update(user).then(rows => {
            res.redirect('/login');
        }).catch(err => {
            req.flash('error', 'Error Server');
            return res.redirect('back');
        });
    }).catch(err => {
        req.flash('error', 'Error Server');
        return res.redirect('back');
    });
});

module.exports = router;