const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');
const {Person} = require('./../server/models/person');

// Person.remove({}).then((result) => {
//   console.log(result);
// });

// Person.findOneAndRemove().
// Person.findByIdAndRemove()
//
// Person.findOneAndRemove({_id: '5a881f54b7838a49ec047eae'}).then((person) => {
//   console.log(person);
// });
//
Person.findByIdAndRemove('5a881eb1b7838a49ec047ead').then((person) => {
  console.log(person);
});
