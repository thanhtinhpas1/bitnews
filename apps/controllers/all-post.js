var express =require('express');
var router = express.Router();
var postDB = require('../models/posts');

router.get('/', (req, res) => {

    var limit = 9;
    var page = req.query.page || 1;
    if (+page < 1) page = 1;

    var offset = (+page - 1) * limit;

    Promise.all([postDB.countPage(), postDB.getPage(limit, offset)])
    .then(values => {
        var pagination = [];

        //TH
        //1. page <= 5
        //2. page < total - 5
        //3. page >= total - 5
        var total = Math.floor(values[0][0].total / limit);
        console.log(total);
        if (values[0][0].total % limit > 0) total++;
        if (total < 5) {
            for (var i = 1; i <= total; i++) {
                var obj = {value: i};
                if (i == +page) {
                    obj.active = true;
                }
                pagination.push(obj);
            }
        }
        else if (+page < 3){
            for (var i = 1; i <= 5; i++) {
                pagination.push({value: i});
            }
            pagination[+page - 1].active = true;
        }
        else if (+page < total - 3){
            pagination.push({value: 1});
            pagination.push({value: '...'});
            pagination.push({value: +page-1});
            pagination.push({value: page});
            pagination[3].active = true;
            pagination.push({value: +page + 1});
            pagination.push({value: '...'});
            pagination.push({value: total});
        }
        else if (+page >= total - 3) {
            pagination.push({value: 1});
            pagination.push({value: '...'});
            for (var i = total - 3; i <= total; i++) {
                var obj = {value: i};
                if (i == +page) {
                    obj.active = true;
                }
                pagination.push(obj);
            }
        }

        //page previous and next
        var previous = false, next = false;
        var pagePrevious = +page, pageNext = +page;
        if (+page == 1) {
            previous = true;
        }
        else {
            pagePrevious = +page - 1;
        }
        if (+page == total) next = true;
        else {
            pageNext = +page + 1;
        }
        console.log(pageNext);
        
        res.render('all_post', {title: 'all-post', layout: 'base-view-posts',
        posts: values[1],
        pagination,
        previous,
        next,
        pagePrevious,
        pageNext
        });
    })
    .catch(err => console.log(err));
})

module.exports = router;