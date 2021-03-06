require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose');
var {Person} = require('./models/person');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');

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

app.delete('/people/:id', (req, res) => {
  var id = req.params.id;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Person.findByIdAndRemove(id).then((person) => {
    if (!person) {
      return res.status(404).send();
    }

    res.send({person});
  }).catch((e) => {
    res.status(400).send();
  });
});

app.patch('/people/:id', (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['nationalid', 'name.first', 'name.father', 'name.family', 'alive']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  if (_.isBoolean(body.alive) && !body.alive) {
    body.deadAt = new Date().getTime();
  } else {
    body.alive = true;
    body.deadAt = null;
  }

  Person.findByIdAndUpdate(id, {$set: body}, {new: true}).then((person) => {
    if (!person) {
      return res.status(404).send();
    }

    res.send({person});

  }).catch((err) => {
    res.status(400).send();
  });

});

///////////////////////////////////


app.post('/users', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);
  var user = new User(body);

  user.save().then(() => {
    return user.generateAuthToken();
  }).then((token) => {
    res.header('x-auth', token).send(user);
  }).catch((e) => {
    res.status(400).send(e);
  })
});




app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});


app.listen(port, () => {
  console.log(`Started up at port ${port}`);
});

module.exports = {app};
