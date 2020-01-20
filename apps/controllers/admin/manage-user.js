var express = require('express');
var router = express.Router();
var db = require('../../models/user');
var moment = require('moment');
var bcrypt = require('bcrypt');
var config = require('config');
var utils = require('../../helpers/helper');
//require db
var catDB = require('../../models/categories');
var roleDB = require('../../models/roles');

router.get("/", function (req, res) {
    var users = db.getAllUserWithRole();
    var catRS = catDB.getAllCategory();
    Promise.all([users, catRS]).then(values => {
        res.render("admin/manage-user", { title: "manage-user", layout: "admin/baseview", users: values[0], categories: values[1] });
    })
        .catch(err => {
            console.log(err);
        })
});

router.get("/delete", (req, res) => {
    var id = req.query.id;
    if (id > 0) {
        var dl = db.deleteUserById(id);
        dl.then(rows => {
            console.log("Delete success: " + rows)
        })
            .catch(err => {
                console.log("Delete failedL: " + err);
            })
    }
    res.redirect('/admin/manage-user');
});

router.get("/add", (req, res) => {
    var catRS = catDB.getAllCategory();
    var roleRS = roleDB.getAll();
    Promise.all([catRS, roleRS]).then(values => {
        res.render("admin/add_new_user", { title: "add-user", layout: "admin/baseview", categories: values[0], roles: values[1] });
    })
        .catch(err => console.log(err));
});

router.get('/is-available', (req, res, next) => {
    var user = req.query.username;
    console.log(user);
    db.singleByUserName(user).then(rows => {
        if (rows != null) {
            return res.json(false);
        }
        return res.json(true);
    }).catch(err => res.json(true));
})

router.post("/add", (req, res) => {
    var entity = req.body;
    var saltRounds = config.get('salt');
    var hash = bcrypt.hashSync(req.body.password, saltRounds);
    console.log(entity);
    entity.password = hash;
    if (entity) {
        if (entity.role_id == 2) {
            var now = utils.GetTimeNow();
            var expire = moment(now, "YYYY-MM-DD").add(7, 'days');
            entity.expiry_date = expire.format("YYYY-MM-DD hh:mm:ss");
        }
        console.log(entity);

        var rs = db.addNewUser(entity);
        rs.then(row => {
            console.log("Add new user success");
        }).catch(err => {
            console.log('Add new user failed cause: ' + err);
        });
    }
    res.redirect('/admin/manage-user');
});

router.post('/:id/change-category', (req, res) => {
    var category_id = req.query.category_id;
    var user_id = req.params.id;
    if (category_id > 0 && user_id > 0) {
        var userRS = db.findById(user_id);
        userRS.then(value => {
            value.category_id = category_id;
            var rs = db.updateUser(value);
            rs.then(value => {
                res.json(200);
            })
                .catch(err => {
                    console.log(err);
                    res.json(500);
                });
        })
            .catch(err => {
                console.log(err);
                res.json(500);
            })
    }
});

router.post('/:id/change-expiration', (req, res) => {
    var user_id = req.params.id;
    if (req.body.expiry_date != null && user_id > 0) {
        var userRS = db.findById(user_id);
        userRS.then(value => {
            var dateString = req.body.expiry_date;
            var dateObj = new Date(dateString);
            var momentObj = moment(dateObj);
            var momentString = momentObj.format('YYYY-MM-DD');
            value.expiry_date = momentString;
            var rs = db.updateUser(value);
            rs.then(value => {
                res.json(200);
            })
                .catch(err => {
                    console.log(err);
                    res.json(500);
                });
        })
            .catch(err => {
                console.log(err);
                res.json(500);
            })
    }
});

router.get('/edit/:id', (req, res) => {
    var id = req.params.id;
    var catRS = catDB.getAllCategory();
    var roleRS = roleDB.getAll();
    var usr = db.findById(id);
    Promise.all([catRS, roleRS, usr]).then(values => {
        if (values[0].length > 0 && values[1].length > 0 && values[2] != null) {

            //active if have category id
            var rs = values[0].filter(x => x.id == values[2].category_id);
            if (rs.length > 0) {
                rs[0]['active'] = true;
            }
            //active if have role id
            var role = values[1].filter(x => x.id == values[2].role_id);
            if (role.length > 0) {
                role[0]['active'] = true;
            }

            //active expirate date if user is subscribe
            if (values[2].role_id == 2) {
                values[2]['expiration'] = true;
            }
        }
        res.render("admin/edit_user", { title: 'edit-user', layout: 'admin/baseview', categories: values[0], roles: values[1], user: values[2] });
    })
        .catch(err => {
            console.log(err);
        });
});

router.post('/edit/:id', (req, res) => {
    var user_id = req.params.id;
    if (user_id > 0) {
        var usr = db.findById(user_id);
        usr.then(entity => {
            var entityUpdate = req.body;
            entityUpdate['id'] = entity.id;
            entityUpdate['access_token'] = entity.access_token;
            entityUpdate['manage_by'] = entity.manage_by;
            entityUpdate['created_at'] = entity.created_at;
            entityUpdate['updated_at'] = entity.updated_at;
            if (entityUpdate.role_id != 2) {
                entityUpdate['expiry_date'] = null;
            }
            else if (entityUpdate.role_id != 4) {
                entityUpdate['category_id'] = 0;
            }
            var rs = db.updateUser(entityUpdate);
            rs.then(values => {
                res.redirect('/admin/manage-user');
            })
                .catch(err => {
                    console.log(err);
                    res.redirect('/admin/manage-user');
                })
        })
            .catch(err => {
                console.log(err);
                res.redirect('/admin/manage-user');
            });
    }
});

module.exports = router;