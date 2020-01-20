var express = require('express');
var router = express.Router();
var userModel = require('../models/user');

router.get("/:id", function (req, res) {
    var isActive = false;
    var user = userModel.findById(req.params.id);
    user.then(rows => {
        if(rows.role_id == 3){
            isActive = true;
        }
        console.log(rows);
        res.render("update-profile", {
            title: "manage-draft",
            layout: "edit-profile",
            user: rows,
            isActive: isActive
        });
    }).catch(err => {
        console.log(err);
    });
});
router.post("/:id", function (req, res) {
    var user = userModel.findById(req.params.id);
    user.then(user => {
        if (!user) {
            return res.redirect('back');
        }
        user.name = req.body.name;
        user.pseudonym = req.body.pseudonym;
        user.email = req.body.email;
        user.birthday = req.body.birthday;
        userModel.update(user).then(err => {
            console.log(user);
            switch (user.role_id) {
                case 1:
                    res.redirect('../');
                    break;
                case 3:
                    res.redirect('../writer');
                    break;
                case 4:
                    res.redirect('../editor');
                    break;
                case 5:
                    res.redirect('../admin');
                    break;
                default:
                    res.redirect('../');
                    break; ''
            }
        }).catch(err => {
            console.log(err);
            return res.redirect('back');
        });

    }).catch(err => {
        console.log(err);
        return res.redirect('back');
    });
});
module.exports = router;