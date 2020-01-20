var express = require('express');
var router = express.Router();
var util = require('../../helpers/helper');
var db = require('../../models/posts');
var tagDb = require('../../models/tags');
var tagedDb = require('../../models/post_tagdes');
var categoriesDb = require('../../models/categories');

router.get("/", function(req, res) {
    console.log(req.user.id);
    var p = db.getAllPostsEditorManage(3, req.user.id);
    p.then(rows =>{
        console.log(rows);
        res.render("editor/manage-draft", {
            title:"manage-draft",
            layout: "../views/baseview-editor",
            listPost : rows
        });
    }).catch(err =>{
        console.log(err);
    });
});
router.get("/refuse-post/:id", function (req, res) {
    var id = req.params.id;
    p = db.findById(id);
    p.then(rows => {
        console.log(rows);
        res.render("editor/refuse-post", {
            title: "manage-draft",
            layout: "../views/baseview-editor",
            post: rows
        });
    }).catch(err => {
        console.log(err);
    });


});
router.post("/refuse-post/:id", function (req, res) {
    var id = req.params.id;
    p = db.findById(id);
    p.then(entity => {
        entity.fail_reason = req.body.fail_reason;
        entity.status = 2;
        var rs = db.updatePost(entity);
        rs.then(rs => { 
            console.log('Update success');  
            res.json(200);
        }).catch(err => {
            console.log(err);
            res.redirect('editor/manage-draft');
        });
    }).catch(err => {
        console.log(err);
    });
});
router.get("/confirm-post/:id", function (req, res) {
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
        res.render("editor/confirm-post", {
            title: "manage-draft",
            layout: "../views/baseview-editor",
            post: values[2],
            categories: values[3],
            tags: values[0]
        });
    }).catch(err => {
        console.log(err);
    });
});

router.post('/confirm-post/:id', (req, res) => {
    var id = req.params.id;
    var entity = db.findById(id);
    entity.then(entity => {    
        entity.category_id = req.body.category_id;
        entity.post_date = util.UpdatePostDate(req.body.post_date);
        entity.status = 0;
        var rs = db.updatePost(entity);
        rs.then(rs => { 
            console.log('Update success');  
            res.json(200);
        }).catch(err => {
            console.log(err);
            res.redirect('editor/');
        });
    })
    .catch(err => {
        console.log(err);
        res.redirect('editor/');
    })
});

router.post('/taged/:id', (req, res) => {
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
        res.redirect('editor/');
    });
});

router.get('/detail/:id', (req, res) => {
    var id = req.params.id;
    var post = db.findById(id);
    var tagedRS = tagedDb.findTagByPostId(id);
    var catRS = categoriesDb.getAllCategory();
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
        res.render("editor/post-detail", {title: "post-detail", layout: "../views/baseview-editor", category: category, tags: values[1], post: values[2]});
    })
    .catch(err => {
        console.log(err);
    })
});
router.get("/post-approved", function(req, res) {
    console.log(req.user.id);
    var p = db.getAllPostsApprovedEditorManage(req.user.id);
    p.then(rows =>{
        console.log(rows);
        res.render("editor/manage-post-approved", {
            title:"manage-draft",
            layout: "../views/baseview-editor",
            listPost : rows
        });
    }).catch(err =>{
        console.log(err);
    });
});
router.get("/post-denied", function(req, res) {
    console.log(req.user.id);
    var p = db.getAllPostsEditorManage(2, req.user.id);
    p.then(rows =>{
        console.log(rows);
        res.render("editor/manage-post-denied", {
            title:"manage-draft",
            layout: "../views/baseview-editor",
            listPost : rows
        });
    }).catch(err =>{
        console.log(err);
    });
});
module.exports = router;