var express = require('express');
var router = express.Router();
var categoriesModel = require('../../models/categories');
var tagsModel = require('../../models/tags');
var db = require('../../models/posts');
var tagDb = require('../../models/tags');
var tagedDb = require('../../models/post_tagdes');


router.get("/", function (req, res) {

    var c = categoriesModel.getAllCategory();
    var t = tagsModel.getAllTag();
    Promise.all([c, t]).then(values => {
        res.render("writer/add-content", {
            title: "add-content",
            layout: "../views/baseview-writer",
            categories: values[0],
            tags: values[1]
        });
    }).catch(err => {
        console.log(err);
    });
});

router.post("/", (req, res) => {
    var entity = req.body;
    entity.status = 3;
    entity.author_name = req.user.pseudonym;
    entity.created_by = req.user.id;
    entity.thumb_img = '';
    if (entity) {
        var rs = db.addNewPost(entity);
        //TODO: add field created by and author name
        rs.then(row => {
            console.log("Add new post success");
            // res.redirect('../');
            res.json(row.insertId);
        }).catch(err => {
            console.log('Add new post failed cause: ' + err);
            res.redirect('../');
        });

    }
});

router.post("/taged/:id", (req, res) => {
    var id = req.params.id;
    var tags = req.body;
    var listTag = tagDb.getAllTag();
    listTag.then(rs => {
        for (var i = 0; i < tags.length; i++) {
            var tmp = rs.filter(item => item.id == tags[i]);
            if (tmp.length > 0) {
                var entity = {};
                entity['tag_name'] = tmp[0].name;
                entity['tag_id'] = tmp[0].id;
                entity['post_id'] = id;
                var rsTag = tagedDb.addPostTag(entity);
                rsTag.then(rs => console.log('success' + entity['post_id'])).catch(err => console.log(err));
            }
        }
        res.json(200);
    }).catch(err => {
        console.log(err);
        res.json(500);
    })
});


module.exports = router;