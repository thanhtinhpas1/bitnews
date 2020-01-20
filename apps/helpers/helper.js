var bcrypt = require('bcrypt');
var config = require('config');
var moment = require("moment");

function GetTimeNow() {
    return moment().format("YYYY/MM/DD hh:mm:ss")
}
function UpdatePostDate(value) {
    return moment(value).format("YYYY/MM/DD hh:mm:ss")
}
function ConvertToMilliSecond(value) {
    return moment.utc(value).valueOf();
}
function hash_password(password) {
    var saltRounds = config.get('salt');
    var hash = bcrypt.hashSync(password, saltRounds);
    return hash;
}

module.exports = {
    hash_password: hash_password,
    GetTimeNow: GetTimeNow,
    UpdatePostDate: UpdatePostDate,
    ConvertToMilliSecond : ConvertToMilliSecond
}