var createError = require('http-errors');

module.exports = (req, res, next) => {
  if (!req.user) {
    req.session.redirectTo = "/admin";
    res.redirect('/login');
  }
  else {
    var user = req.user;
    if (user.role_id == 5)
      next();
    else 
      next(createError(403));
  }
}
