const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Person} = require('./../../models/person');
const {User} = require('./../../models/user');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const users = [{
  _id: userOneId,
  email: 'Dohmi@example.com',
  password: 'User1pass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userOneId, access: 'auth'}, 'abc123').toString()
  }]
}, {
  _id: userTwoId,
  email: 'Abdulrahman@example.com',
  password: 'User2pass'
}];

const people = [{
  _id: new ObjectID(),
  nationalid: 'First test person'
}, {
  _id: new ObjectID(),
  nationalid: 'Second test person',
  alive: true,
  deadAt: 222,
}];


const populatePeople = (done) => {
  Person.remove({}).then(() => {
    return Person.insertMany(people);
  }).then(() => done());
};

const populateUsers = (done) => {
  User.remove({}).then(() => {
    var userOne = new User(users[0]).save();
    var userTwo = new User(users[1]).save();

    // this promise will wait for all the above save actions to complete
    return Promise.all([userOne, userTwo]);
  }).then(() => done());
};

module.exports = {people, populatePeople, users, populateUsers};
