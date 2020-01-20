var db = require("../common/database");

function getAllUser() {
    return db.findAll("users");
}

function getAllUserWithRole() {
    var sql = `SELECT u.*, r.name as role_name, c.name as category_name from users u 
    LEFT JOIN roles r on u.role_id =  r.id LEFT JOIN categories c on u.category_id = c.id and u.role_id = 4`;
    return db.excute(sql);
}

function deleteUser(id) {
    return db.deleteById("users", id);
}

function deleteUserById(id) {
    return db.deleteById('users', id);
}

function addNewUser(entity) {
    return db.add("users", entity);
}
function findOneByEmail(email) {
    return db.findOne('users', 'email', email);
}
function update(entity) {
    return db.update('users', entity)
}
function findOneByToken(entity) {
    return db.findOne('users', 'reset_token', entity);
}
function updateUser(entity) {
    return db.update('users', entity);
}

module.exports = {
    singleByUserName: userName => {
        return db.load(`select * from users where username = '${userName}'`);
    },
    singleByEmail: email => {
        return db.load(`select * from users where email = '${email}'`);
    },
    findById: id => {
        return db.findById('users', id);
    },
    findByUsername: userName => {
        return db.findOne('users', 'username', userName);
    },
    getAllUser: getAllUser,
    deleteUser: deleteUser,
    addNewUser: addNewUser,
    findOneByEmail: findOneByEmail,
    update: update,
    findOneByToken: findOneByToken,
    getAllUserWithRole: getAllUserWithRole,
    updateUser: updateUser,
    deleteUserById: deleteUserById
}