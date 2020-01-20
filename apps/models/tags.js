
var db = require("../common/database");

function getAllTag() {
    return db.findAll("tags");
}

function deleteTagById(id){
    return db.deleteById("tags", id);
}

function addNewTag(entity) {
    return db.add("tags", entity);
}

function findTagById(id) {
    return db.findById('tags', id);
}

function updateTag(entity) {
    return db.update('tags', entity);
}




module.exports = {
    getAllTag: getAllTag,
    deleteTagById: deleteTagById, 
    addNewTag: addNewTag,
    findTagById: findTagById,
    updateTag: updateTag,
}