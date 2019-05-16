const { User } = require("./../models/user");

let auth = (req, res, next) => {
  // check if token is ok
  let token = req.cookies.w_auth;

  User.findByToken(token, (err, user) => {
    if (err) {
      throw err;
    }
    if (!user) {
      return res.json({
        isAuth: false,
        error: true
      });
    }

    //* if user is good send request for token
    req.token = token;
    req.user = user;
    next();
  });
};

module.exports = { auth };
