var db = require("../common/database");

function getAll(){
    return db.findAll("comments")
}

function findCommentsOfPost(id) {
   return db.findListByField('comments', 'post_id', id);
}

function addComment(entity) {
    return db.add('comments', entity);
}

module.exports = {
    getAll: getAll,
    findCommentsOfPost: findCommentsOfPost,
    addComment: addComment
}