var express = require('express');
var router = express.Router();
var db =  require('../../models/tags');

router.get("/", function (req, res) {
    var tags = db.getAllTag();
    tags.then(rows => {
        res.render("admin/manage-tag", { title: "manage-tag", layout: "admin/baseview", tags: rows });
    }).catch(err => {
        console.log(err);
    })
});


router.get("/delete", (req, res) => {
    var id = req.query.id;
    if (id > 0) {
        var dl = db.deleteTagById(id);
        dl.then(rows =>{
            console.log("Delete success: " + rows)
        })
        .catch(err => {
            console.log("Delete failed: " + err);
        })
    }
    res.redirect('/admin/manage-tag');
});

router.post("/add", (req, res) => {
    var entity = req.body;
    console.log(entity);
    if (entity) {
        var rs = db.addNewTag(entity);
        rs.then(row => {
            console.log("Add new Tag success");
        }).catch(err => {
            console.log('Add new Tag failed cause: ' + err);
        });
    }
    res.redirect('/admin/manage-tag');
});

router.get('/edit/:id', (req, res) => {
    var entity = db.findTagById(req.params.id);
    entity.then(entity => {
        console.log(entity);
        res.json(entity);
    })
    .catch(err => console.log(err));
});

router.post('/edit/:id', (req, res) => {
    var entity = db.findTagById(req.params.id);
    entity.then(entity => {
        entity.name = req.body.name;
        db.updateTag(entity);
    })
    .catch(err => console.log(err));
    res.redirect('../');
});

module.exports = router;