var postDB = require("../models/posts");
var tagDB = require("../models/tags");
var cateDB = require("../models/categories");

module.exports = (req,res,next) => {
    postDB.findAll().then(rows => {
        res.locals.lcPost = rows;
    }).catch(err => {
        console.log(err);
    })

    postDB.getTopView().then(rows => {
        res.locals.lcTopView = rows;
    }).catch(err => {
        console.log(err);
    })

    postDB.getTopHot().then(rows => {
        res.locals.lcTopHot = rows;
        next();
    }).catch(err => {
        console.log(err);
    })

    cateDB.getTopCate().then(rows => {
        res.locals.lcTopCate = rows;
    }).catch(err => {
        console.log(err);
    })

    tagDB.getAllTag().then(rows => {
        res.locals.lcAllTag = rows;
    }).catch(err => {
        console.log(err);
    })

    cateDB.getAllCategory().then(rows => {
        var parentMenu = [];
        if(rows.length > 0){
            parentMenu = rows.filter(x => x.parent_id == 0);
            for (const item of parentMenu) {
                var childrenMenu = rows.filter(x => x.parent_id == item.id);
                item['childs'] = childrenMenu;
            }
        }  
        res.locals.lcAllCate = parentMenu;
    }).catch(err => {
        console.log(err);
    })

    
}