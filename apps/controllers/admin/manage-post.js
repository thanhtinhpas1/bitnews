var express = require('express');
var router = express.Router();
var db = require('../../models/posts');
var categoryDb = require('../../models/categories');
var tagDb = require('../../models/tags');
var tagedDb = require('../../models/post_tagdes');
var userDb = require('../../models/user');

router.get("/", function (req, res) {
    var posts = db.findAll();
    posts.then(rows => {
        var rs = db.findAll();
        rs.then(tmp => {
            for (const item of tmp) {
                switch(item.status) {
                case 1:
                    item['statusName']  = "Published";
                    item['label'] = "label-success";
                break;
                default: 
                    item['statusName']  = "Draft";   
                    item['label'] = "label-primary";
                    break;
                }
            }
            res.render("admin/manage-post", { title: "manage-post", layout: "admin/baseview", list: tmp });
        }).catch(err => {
            console.log('Failed to get author of post');
            res.render("admin/manage-post", { title: "manage-post", layout: "admin/baseview" });
        });
    }).catch(err => {
        console.log(err);
    })
});

//FIXME: can't delete when have foreign key
router.get("/delete", (req, res) => {
    var id = req.query.id;
    if (id > 0) {
        var dl = db.deletePostById(id);
        dl.then(rows => {
            console.log("Delete success: " + rows)
        })
            .catch(err => {
                console.log("Delete failed: " + err);
            })
    }
    res.redirect('/admin/manage-post');
});

router.get('/load-categories', (req, res) => {
    //get all categories
    var catRs = categoryDb.getAllCategory();
    catRs.then(rs => {
        res.json(rs);
    }).catch(err => {
        console.log(err);
    });
});

router.get('/load-tags', (req, res) => {
    //get all categories
    var tags = tagDb.getAllTag();
    tags.then(rs => {
        res.json(rs);
    }).catch(err => {
        console.log(err);
    });
});

router.get("/add", (req, res) => {
    var catRS = categoryDb.getAllCategory();
    var tagRS = tagDb.getAllTag();
    Promise.all([catRS, tagRS]).then(values => {
        res.render("admin/add_post", { title: "add-post", layout: "admin/baseview", categories: values[0], tags: values[1] });
    })
    .catch(err => {

    });
});

router.post("/add", (req, res) => {
    var entity = req.body;
    entity.status = 3;
    entity.thumb_img = '';
    entity.created_by = req.session.passport.user.id;
    entity.author_name = req.user.pseudonym;

    if (entity) {
        var rs = db.addNewPost(entity);
        //TODO: add field created by and author name
        rs.then(row => {
            console.log("Add new post success");
            // res.redirect('../');
            res.json(row.insertId);
        }).catch(err => {
            console.log('Add new post failed cause: ' + err);
         //   res.redirect('../');
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

router.get('/edit/:id', (req, res) => {
    var id = req.params.id;
    var catRS = categoryDb.getAllCategory();
    var tagRS = tagDb.getAllTag();
    var post = db.findById(id);
    var tags_posted = tagedDb.findTagByPostId(id);
    Promise.all([catRS, tagRS, post, tags_posted]).then(values => {
        console.log(values[2]);
        if (values[2] != null) {
            for (const item of values[0]) {
                if (item.id == values[2].category_id) {
                    item['isActive'] = true;
                    break;
                }
            }
        }
        if (values[1] != null && values[3] != null) {
            for (const item of values[1]) {
                var rs = values[3].filter(x => x.tag_id == item.id);
                if (rs.length > 0) {
                    item['active'] = true;
                }
            }
        }
        res.render("admin/edit_post", { title: "edit-post", layout: "admin/baseview", categories: values[0], tags: values[1], post: values[2], id: id });
    })
        .catch(err => console.log(err));
});

router.post('/edit/:id', (req, res) => {
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
            res.redirect('/admin/manage-post');
        });
    })
    .catch(err => {
        console.log(err);
        res.redirect('/admin/manage-post');
    })
});

router.post('/edit/taged/:id', (req, res) => {
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
        res.redirect('/admin/manage-post');
    });
});

router.get('/detail/:id', (req, res) => {
    var id = req.params.id;
    var post = db.findById(id);
    var tagedRS = tagedDb.findTagByPostId(id);
    var catRS = categoryDb.getAllCategory();
    Promise.all([catRS, tagedRS, post]).then(values => {
        if (values[2] != null) {
            var category;
            for (const item of values[0]) {
                if (values[2].category_id == item.id) {
                    category = item;
                    break;
                }
            }

            switch(values[2].status) {
            case 1:
                values[2]['statusName']  = "Published";
                values[2]['label'] = "label-success";
            break;
            default: 
                values[2]['statusName']  = "Draft";   
                values[2]['label'] = "label-primary";
                break;
            }
        }
        res.render("admin/post-detail", {title: "post-detail", layout: "admin/baseview", category: category, tags: values[1], post: values[2]});
    })
    .catch(err => {
        console.log(err);
    })
});

//change-status
router.get('/:id/change-status', (req, res) => {
    var id = req.params.id;
    var status = req.query.status;
    var post = db.findById(id);
    post.then(post => {
        post.status = status;
        var update = db.updatePost(post);
        update.then(rs => {
            res.redirect('/admin/manage-post');
        })
        .catch(err => {
            console.log(err);
            res.redirect('/admin/manage-post');
        })
    })
    .catch(err => {
        console.log(err);
    })
})


module.exports = router;