var express = require('express');
var router = express.Router();

router.get("/", function(req, res) {
    res.render("", {title: "admin-email", layout: __dirname + "/../../views/admin/email"});
});

module.exports = router;