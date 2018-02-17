//require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose');
var {Person} = require('./models/person');
var {User} = require('./models/user');
//var {Person} = require('./models/person');

var app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

app.post('/people', (req, res) => {
  var person = new Person({
    nationalid: req.body.nationalid
  });

  person.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/people', (req, res) => {
  Person.find().then((people) => {
    res.send({people});
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/people/:id', (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Person.findById(id).then((person) => {
    if (!person) {
      return res.status(404).send();
    }

    res.send({person});
  }).catch((e) => {
    res.status(400).send();
  });
});

// app.delete('/people/:id', (req, res) => {
//   var id = req.params.id;
//
//   if (!ObjectID.isValid(id)) {
//     return res.status(404).send();
//   }
//
//   Person.findByIdAndRemove(id).then((person) => {
//     if (!person) {
//       return res.status(404).send();
//     }
//
//     res.send({person});
//   }).catch((e) => {
//     res.status(400).send();
//   });
// });
//
// app.patch('/people/:id', (req, res) => {
//   var id = req.params.id;
//   var body = _.pick(req.body, ['nationalid', 'completed']);
//
//   if (!ObjectID.isValid(id)) {
//     return res.status(404).send();
//   }
//
//   if (_.isBoolean(body.completed) && body.completed) {
//     body.completedAt = new Date().getTime();
//   } else {
//     body.completed = false;
//     body.completedAt = null;
//   }
//
//   Person.findByIdAndUpdate(id, {$set: body}, {new: true}).then((person) => {
//     if (!person) {
//       return res.status(404).send();
//     }
//
//     res.send({person});
//   }).catch((e) => {
//     res.status(400).send();
//   })
// });
//
// // POST /users
// app.post('/users', (req, res) => {
//   var body = _.pick(req.body, ['email', 'password']);
//   var user = new User(body);
//
//   user.save().then((user) => {
//     res.send(user);
//   }).catch((e) => {
//     res.status(400).send(e);
//   })
// });

app.listen(port, () => {
  console.log(`Started up at port ${port}`);
});

module.exports = {app};
