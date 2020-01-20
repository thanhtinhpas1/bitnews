
var db = require("../common/database");

function loadNews() {
    return db.findAll("posts");
}

function displayHotNews(){
    return db.displayTopHotNew("posts");
}

function displayTopView(){
    return db.displayTopViewer("posts");
}
module.exports = {
    loadNews: loadNews,
    displayHotNews: displayHotNews,
    displayTopView: displayTopView,
    findById: id => {
        return db.findById("posts", id);
    }
}