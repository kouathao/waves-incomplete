const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SALT_I = 10;
require("dotenv").config();

// Create a Schema
const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    unique: 1
  },
  password: {
    type: String,
    required: true,
    minlength: 5
  },
  name: {
    type: String,
    required: true,
    maxlength: 100
  },
  lastname: {
    type: String,
    required: true,
    maxlength: 100
  },
  cart: {
    type: Array,
    default: []
  },
  history: {
    type: Array,
    default: []
  },
  role: {
    type: Number,
    default: 0
  },
  token: {
    type: String
  }
});

// pre() = before we do something we want to do something
userSchema.pre("save", function(next) {
  var user = this;

  //* isModified() is from mongo function,
  //* which listens for password change
  //* if use change password execute hash

  if (user.isModified("password")) {
    // bcrypt.genSalt generate salt,
    // 1) pass in salt as first argument
    // passed in function

    bcrypt.genSalt(SALT_I, function(err, salt) {
      // if err return skip
      if (err) return next(err);
      // no error has password
      // pass in password, salt, then call back function

      bcrypt.hash(user.password, salt, function(err, hash) {
        if (err) return next(err);

        // store user.password = hash;
        user.password = hash;
        // move forward to the next thing
        next();
      });
    });
  } else {
    // go next
    next();
  }
});

// method to compare password
userSchema.methods.comparePassword = function(canidatePassword, cb) {
  bcrypt.compare(canidatePassword, this.password, function(err, isMatch) {
    if (err) {
      return cb(err);
    }
    cb(null, isMatch);
  });
};

userSchema.methods.generateToken = function(cb) {
  // alais of user
  var user = this;
  // generate token
  var token = jwt.sign(user._id.toHexString(), process.env.SECRET);

  user.token = token;
  user.save(function(err, user) {
    if (err) {
      return cb(err);
    }
    cb(null, user);
  });
};

userSchema.statics.findByToken = function(token, cb) {
  var user = this;

  jwt.verify(token, process.env.SECRET, function(err, decode) {
    user.findOne({ _id: decode, token: token }, function(err, user) {
      if (err) {
        return cb(err);
      }
      cb(null, user);
    });
  });
};

const User = mongoose.model("User", userSchema);

// export model
module.exports = { User };
