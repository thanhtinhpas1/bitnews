var express = require('express');
var router = express.Router();
var postdb = require("../models/posts");
var catedb = require("../models/categories");
var userdb = require("../models/user");
var posttagdb = require("../models/post_tagdes");
var commentdb = require("../models/comments");
var tagdb = require("../models/tags");
var util = require('../helpers/helper');
//import middle ware
var phantom = require('phantom');
var path = require('path');
var auth = require('../middlewares/auth-locals.mdw');

//middleware
router.use(require("../middlewares/local.mdw"));

//TODO: check user before go to single post to show premium post
router.get("/:id", function (req, res) {

    var id = req.params.id;
    var singlePost = postdb.findByPostId(parseInt(req.params.id));
    var postTag = posttagdb.getAllPostTag();
    var allPost = postdb.findAllPost();
    var allComment = commentdb.findCommentsOfPost(id);
    var isCheck = false;
    var isPremium = false;

    Promise.all([singlePost, postTag, allPost, allComment]).then(values => {
        var post = values[0];
        var postTag = values[1];
        var allPost = values[2];
        console.log(post);
        if (req.user != null) {
            if (req.user.role_id == 2) {
                isCheck = true;
            }
            var datenow = util.ConvertToMilliSecond(util.UpdatePostDate(Date.now()));
            var date_expries = util.ConvertToMilliSecond(util.UpdatePostDate(req.user.expiry_date));
            var subs = date_expries - datenow;
            console.log(subs);
            console.log(req.user);
            if (subs < 0) {
                return res.redirect('/extend');
            }            
        } else {
            if(post.premium_status == 1){
                return res.redirect('/login?premium=1');
            }
        }
        //Get list post have the same category
        var lstSameCate = allPost.filter(item => {
            if (item.category_id == post.category_id && item.id != post.id)
                return item;
        })

        var lstPostTag = postTag.filter(item => {
            if (item.post_id == post.id)
                return item;
        })
        if(values[0]!=null){
            if(post.premium_status == 1){
                isPremium = true;
            }
        }
        for (const item of lstSameCate) {
            if(item.premium_status == 1){
                item['isActive'] = true;
            }
        }
        for (const c of res.locals.lcTopView) {
            if(c.premium_status == 1){
                c.isActive = true;
            }
        }
        for (const c of res.locals.lcTopHot) {
            if(c.premium_status == 1){
                c.isActive = true;
            }
        }
        res.render("03_single-post", {
            title: "single-post",
            layout: 'base-view-1',
            post: post,
            isPremium: isPremium,
            sameCate: lstSameCate, //List post have same category
            favNew: res.locals.lcTopHot.slice(0, 2),
            lstCom: values[3],
            lstPostTag: lstPostTag,
            amountOfCom: values[3].length,
            popularNew: res.locals.lcTopHot.slice(0, 2),
            isCheck: isCheck
        });
    });
});

//add comment
router.post('/:id/new-comment', (req, res) => {
    var idPost = req.params.id;
    var entity = req.body;
    entity['post_id'] = idPost;
    var rs = commentdb.addComment(entity);
    rs.then(values => {
        console.log('add comment success');
        res.redirect('/single-post/' + idPost);
    })
        .catch(err => {
            console.log('Failed to add new comment');
            res.redirect('/single-post/' + idPost);
        })
})

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
router.get("/print-post/:id", function (req, res) {
    var id = req.params.id;
    var singlePost = postdb.findByPostId(parseInt(req.params.id));
    var allComment = commentdb.findCommentsOfPost(id);

    Promise.all([singlePost, allComment]).then(values => {
        var post = values[0];
        console.log(post)
        res.render("print-post", {
            title: "single-post",
            layout: 'base-view-print-post',
            post: post,
            amountOfCom: values[1].length,
        });
    }).catch(err => {
        console.log(err)
    });
});

//download post
router.get('/:id/download', (req, res) => {
    var id = req.params.id;
    (async function () {
        const instance = await phantom.create();
        const page = await instance.createPage();

        await page.property('viewportSize', { width: 1024, height: 600 });
        const status = await page.open('http://localhost:3000/single-post/print-post/' + id);
        console.log(`Page opened with status [${status}].`);

        //wait for load
        await sleep(2000);

        await page.render('bitnews' + id + '.pdf');

        await instance.exit();

        //done
        var file = __dirname + '/../../bitnews' + id + '.pdf';
        console.log(file);
        res.download(file);
    })();
});

module.exports = router;