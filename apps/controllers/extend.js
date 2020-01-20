var express = require('express');
var router = express.Router();
var userModel = require('../models/user');
var util = require('../helpers/helper');

router.get('/', (req, res) => {
    res.render('extend', { layout: false });
})
router.post('/', (req, res, next) => {
    var expiry_date = util.UpdatePostDate(Date.now() + 604800000);
    if (!req.user) {
        return res.redirect('/');
    } else {
        userModel.findByUsername(req.user.username).then(rows => {
            rows.expiry_date = expiry_date;
            userModel.update(rows).then(id => {
                req.logOut();
                res.redirect('/login');
            }).catch(err => {
                console.log(err);
            })
        })
    }
})

module.exports = router;