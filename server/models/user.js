const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema({
  email: {
    type      : String,
    required  : true,
    trim      : true,
    minlength : 1,
    unique    : true,
    validate  : {
      validator : validator.isEmail,
      message   : '{VALUE} is not a valid email'
    }
  },
  password: {
    type        : String,
    require     : true,
    minlength   : 6
  },
  tokens: [{
    access      : {
      type      : String,
      required  : true
    },
    token: {
      type      : String,
      required  : true
    }
  }]

});

UserSchema.methods.toJSON = function () {
  var user = this;

  // the next line will take the mongoose variable 'user'  and converting it into a regular object where only the properties available on the documetn exists
  var userObject = user.toObject();

  return _.pick(userObject, ['_id', 'email']);
};

// UserSchema.methods defines an instance method
UserSchema.methods.generateAuthToken = function () {

  // instance methods get called with an individual document
  var user = this;
  var access = 'auth';
  var token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString();

  user.tokens.push({access, token});
  return user.save().then(() => {
    return token;
  });
};

// UserSchema.statics defines a model method
UserSchema.statics.findByToken = function (token) {
  // model methods get called with the model (User) as the 'this' binding
  var User = this;
  var decoded;

  try {
    decoded = jwt.verify(token, 'abc123');
  } catch (e) {
    // return new Promise(function(resolve, reject) {
    //   reject();
    // });
    return Promise.reject();
  }

  return User.findOne({
    _id: decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });

};

// run this event before saving the docu to the database. This is mongoose middleware
UserSchema.pre('save', function (next) {
  var user = this;

  if (user.isModified('password')) {
    bcrypt.hash(user.password, 8, function (err, hash) {
      user.password = hash;
      next();
    });


  } else {
    next();
  }
});

var User = mongoose.model('User', UserSchema);

module.exports = {User}
