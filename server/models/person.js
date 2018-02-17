var mongoose = require('mongoose');

var Person = mongoose.model('Person', {
  nationalid: {type: String, required: true},
  name : {
    first       : String,
    father      : String,
    grandfather : String,
    family      : String
  },

  birth   : {
    bdate   : Date,
    city    : String,
    country : String
  },

  addres : {
    buildingNum : Number,
    streetName  : String,
    district    : String,
    city        : String,
    postalCode  : Number,
    addNum      : Number
  }
  , phone         : String
  , maritalStatus : String
  , image         : String
  , alive         : Boolean
  , deadAt        : Number
  , age           : Number
});

module.exports = {Person};
