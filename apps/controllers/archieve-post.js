var express = require('express');
var router = express.Router();
var postdb = require("../models/posts");
var catedb = require("../models/categories");
var tagdb = require("../models/tags");

//middleware
router.use(require("../middlewares/local.mdw"));
var auth = require('../middlewares/auth-locals.mdw');


router.get("/:cateID", function(req, res) {

    var cateID = parseInt(req.params.cateID);

    var posts = postdb.findAllPost();
    var catRS = catedb.findCategorybyId(cateID);
         
    Promise.all([posts, catRS]).then( values => {
        var lstPostOfCate = values[0].filter(item => {
            if(item.category_id == cateID && item.status == 1)
                return item;
        })

        const pageCount = Math.ceil(lstPostOfCate.length / 12);
        let page = parseInt(req.query.page);
        if (!page) { page = 1;}
        if (page > pageCount) {
            page = pageCount
        }
        var pagination = [];
        
        var previous = page - 1, next = page + 1;
        var i = page - 1;
        if (page == 1) i = page;
        else if (page == 0) i = 1;
        for (i; i <= pageCount && pagination.length < 4; i++) {
            var item = {};
            item['page'] = i;
            pagination.push(item);
            if (i == page) {
                pagination[page - 1]['active'] = true;
            }
        }

        if (page == 1 || page == 0) pagination['previous'] = true;
        
        if (page == pageCount) pagination['next'] = true;

        for (const item of lstPostOfCate) {
            if(item.premium_status == 1){
                item['isActive'] = true;
            }
        }
        for (const c of res.locals.lcTopHot) {
            if(c.premium_status == 1){
                c.isActive = true;
            }
        }
        for (const c of res.locals.lcTopView) {
            if(c.premium_status == 1){
                c.isActive = true;
            }
        }
        res.render("02_archive-page", {
            title:"archieve-post",
            layout: "base-view-posts",
            "pagination":pagination,
            "previous": previous,
            "next": next,
            "page": page,
            "pageCount": pageCount,
            "posts": lstPostOfCate.slice(page * 12 - 12, page * 12).sort(function (a, b) {
                return b.premium_status - a.premium_status;
              }),
            category: values[1]
        });
    })
    .catch(err => {
        console.log(err);
    })
});

module.exports = router;