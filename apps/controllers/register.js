var express = require('express');
var router = express.Router();
var userModel = require('../models/user');
var util = require('../helpers/helper');
var moment = require('moment');
// is-available username
router.get('/is-available-username', (req, res, next) => {
  var user = req.query.username;
  userModel.singleByUserName(user).then(rows => {
    if (rows.length > 0) {
      return res.json(false);
    }

    return res.json(true);
  })
})
// is-available email
router.get('/is-available-email', (req, res, next) => {
  var user = req.query.email;
  userModel.singleByEmail(user).then(rows => {
    if (rows.length > 0) {
      return res.json(false);
    }
    return res.json(true);
  })
})
router.get('/', (req, res) => {
  res.render('register', { layout: false });
})
router.post('/', (req, res, next) => {
  var hash = util.hash_password(req.body.password);
  var dob = moment(req.body.dob, 'DD/MM/YYYY').format('YYYY-MM-DD');
  var expiry_date = util.UpdatePostDate(Date.now() + 604800000); // 1 hour

  var entity = {
    username: req.body.username,
    password: hash,
    role_id: 2,
    email: req.body.email,
    birthday: dob,
    expiry_date: expiry_date
  }

  userModel.addNewUser(entity).then(id => {
    res.redirect('/login');
  }).catch(err => {
    console.log(err);

  })
})

module.exports = router;