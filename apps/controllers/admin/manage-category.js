var express = require('express');
var router = express.Router();
var db =  require('../../models/categories');

router.get("/", function(req, res) {
    var categories = db.getAllCategory();
    categories.then(rows => {
        res.render("admin/manage-category", {title: "manage-category", layout:"admin/baseview",  categories : rows});
    }).catch(err => {
        console.log(err);
    })
});

router.get("/delete", (req, res) => {
    var id = req.query.id;clearImmediate
    if (id > 0) {
        var dl = db.deleteCatById(id);
        dl.then(rows =>{
            console.log("Delete success: " + rows)
        })
        .catch(err => {
            console.log("Delete failedL: " + err);
        })
    }
    res.redirect('/admin/manage-category');
});

router.get('/add', (req, res) => {
    var categories = db.getAllCategory();
    categories.then(categories => {
        res.json(categories);
    }).catch(err=> {
        console.log(err);
    });
})

router.post("/add", (req, res) => {
    var entity = req.body;
    console.log(entity);
    if (entity) {
        var rs = db.addNewCategory(entity);
        rs.then(row => {
            console.log("Add new category success");
        }).catch(err => {
            console.log('Add new category failed cause: ' + err);
        });
    }
    res.redirect('/admin/manage-category');
});

router.get("/edit/:id", (req, res) => {
    var id = req.params.id;
    var entity = db.findCategorybyId(id);
    entity.then(category => {
        res.json(category);
    }).catch(err => {
        console.log(err);
    });
  
})

router.post("/edit/:id",(req, res) => {
    var id = req.params.id;
    var entity = db.findCategorybyId(id);
    entity.then(entity => {
        entity.name = req.body.name;
        entity.parent_id = req.body.parent_id;
        var rs = db.updateCategory(entity);
        rs.then(value => {
            console.log('Update category success ' + value);
        })
        .catch(err => {
            console.log('Update failed cause ' + err);
        });
    })
    .catch(err => {
        console.log('Update failed cause ' + err);
    });
    res.redirect('../');
})
module.exports = router;