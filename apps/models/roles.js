var db = require("../common/database");

function getAll() {
    return db.findAll('roles');
}

module.exports = {
    getAll : getAll
}