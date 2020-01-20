var express = require('express');
var router = express.Router();

router.get("/", function(req, res) {
    res.render("", {title: "manage-category", layout: __dirname + "/../../views/admin/manage-accounts"});
});

module.exports = router;