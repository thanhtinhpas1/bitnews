var express = require('express');
var router = express.Router();
var db = require('../../models/posts');
var tagDb = require('../../models/tags');
var tagedDb = require('../../models/post_tagdes');
var categoriesDb = require('../../models/categories');

router.get("/post-wait", function (req, res) {
    var status = 3;
    var created_by = req.user.id;
    var p = db.getAllPostWriter(created_by, status);
    p.then(rows => {
        res.render("writer/post-wait", {
            title: "manage-draft",
            layout: "../views/baseview-writer",
            posts: rows,
        });
    }).catch(err => {
        console.log(err);
    });
});
router.get("/post-refuse", function (req, res) {
    var status = 2;
    var created_by = req.user.id;
    var p = db.getAllPostWriter(created_by, status);
    p.then(rows => {
        res.render("writer/post-err", {
            title: "manage-draft",
            layout: "../views/baseview-writer",
            posts: rows,
        });
    }).catch(err => {
        console.log(err);
    });
});
router.get("/post-success", function (req, res) {
    var status = 1;
    var created_by = req.user.id;
    var p = db.getAllPostWriter(created_by, status);
    p.then(rows => {
        res.render("writer/post-succ", {
            title: "manage-draft",
            layout: "../views/baseview-writer",
            posts: rows,
        });
    }).catch(err => {
        console.log(err);
    });
});
router.get("/post-approved", function (req, res) {
    var status = 0;
    var created_by = req.user.id;
    var p = db.getAllPostWriter(created_by, status);
    p.then(rows => {
        res.render("writer/post-approved", {
            title: "manage-draft",
            layout: "../views/baseview-writer",
            posts: rows,
        });
    }).catch(err => {
        console.log(err);
    });
});
router.get("/edit-post/:id", function (req, res) {
    var id = req.params.id;
    var tagsPost = tagedDb.findTagByPostId(id);
    var tags = tagDb.getAllTag();
    var post = db.findById(id);
    var categories = categoriesDb.getAllCategory();
    Promise.all([tags, tagsPost, post, categories]).then(values => {
        if (values[2] != null) {
            for (const item of values[0]) {
                for (const i of values[1]) {
                    if (i.tag_id === item.id) {
                        item['active'] = true;
                    }
                }
            }
            for (const item of values[3]) {
                if (item.id == values[2].category_id) {
                    item['selected'] = true;
                }
            }
        }
        res.render("edit-post", {
            title: "manage-draft",
            layout: "../views/baseview-writer",
            post: values[2],
            categories: values[3],
            tags: values[0]
        });
    }).catch(err => {
        console.log(err);
    });
});
router.post('/edit-post/:id', (req, res) => {
    var id = req.params.id;
    var entity = db.findById(id);
    entity.then(entity => { 
        entity.title = req.body.title;
        entity.avatar = req.body.avatar;
        entity.content = req.body.content;
        entity.thumb_img = '';
        entity.summary_content = req.body.summary_content;
        entity.category_id = req.body.category_id;
        var rs = db.updatePost(entity);
        rs.then(rs => { 
            console.log('Update success');  
            res.json(200);
        }).catch(err => {
            console.log(err);
            res.redirect('/writer/');
        });
    })
    .catch(err => {
        console.log(err);
        res.redirect('/writer');
    })
});

router.post('/edit-post/taged/:id', (req, res) => {
    var id = req.params.id;
    var tageds = req.body;
    var tags = tagedDb.findTagByPostId(id);
    var allTags = tagDb.getAllTag();
    Promise.all([tags, allTags]).then(values => {
        if (values[0] != null && values[1] != null) {
            //check if have new tag
            for (const item of tageds) {
                //don't have in taged list
                var tmp = values[0].filter(x => x.id == item);
                if (tmp.length == 0) {
                    var tg = values[1].filter(x => x.id == item );
                    var entity = {};
                    entity['tag_name'] = tg[0].name;
                    entity['tag_id'] = tg[0].id;
                    entity['post_id'] = id;
                    var rs = tagedDb.addPostTag(entity);
                    rs.then(rs => console.log('Add new taged post success')).catch(err => console.log(err));
                }
            }
             //check if don't have in old list 
            for (const item of values[0]) {
                var tmp = tageds.filter(x => x == item.id);
                if (tmp.length == 0) {
                    var rs = tagedDb.deleteTagedPostById(item.id);
                    rs.then(rs => console.log('Delete success taged post')).catch(err => console.log(err)); 
                }
            }
            res.json(200);
        }
    })
    .catch(err => {
        console.log(err);
        res.redirect('/writer');
    });
});
module.exports = router;