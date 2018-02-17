const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Person} = require('./../models/person');
const {User} = require('./../models/user');
const {people, populatePeople, users, populateUsers} = require('./seed/seed');


beforeEach(populateUsers);
beforeEach(populatePeople);

describe('POST /people', () => {
  it('should create a new person', (done) => {
    var nationalid = 'Test person nationalid';

    request(app)
      .post('/people')
      .send({nationalid})
      .expect(200)
      .expect((res) => {
        expect(res.body.nationalid).toBe(nationalid);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Person.find({nationalid}).then((people) => {
          expect(people.length).toBe(1);
          expect(people[0].nationalid).toBe(nationalid);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not create person with invalid body data', (done) => {
    request(app)
      .post('/people')
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Person.find().then((people) => {
          expect(people.length).toBe(2);
          done();
        }).catch((e) => done(e));
      });
  });
});

describe('GET /people', () => {
  it('should get all people', (done) => {
    request(app)
      .get('/people')
      .expect(200)
      .expect((res) => {
        expect(res.body.people.length).toBe(2);
      })
      .end(done);
  });
});

describe('GET /people/:id', () => {
  it('should return person doc', (done) => {
    request(app)
      .get(`/people/${people[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.person.nationalid).toBe(people[0].nationalid);
      })
      .end(done);
  });

  it('Should return 404 if todo not found', (done) => {

    var hexId = new ObjectID().toHexString();

    request(app)
      .get(`/people/${hexId}`)
      .expect(404)
      .end(done)
  });

  it('Should return 404 for non-object ids', (done) => {

    request(app)
      .get('/people/123dadsa')
      .expect(404)
      .end(done)
  });
});

describe('DELETE /people/:id', () => {
    it('Should remove a person', (done) => {
      var hexId = people[1]._id.toHexString();

      request(app)
        .delete(`/people/${hexId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.person._id).toBe(hexId);
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          Person.findById(hexId).then((person) => {
            expect(person).toNotExist();
            done();
          }).catch((e) => done(e));
        })
    });


    it('Should return 404 if person not found', (done) => {
      var hexId = new ObjectID().toHexString();

      request(app)
        .delete(`/people/${hexId}`)
        .expect(404)
        .end(done)
    });

    it('Should return 404 if ObjectId is invalid', (done) => {
      request(app)
        .delete('/people/123dadsa')
        .expect(404)
        .end(done)
    });
  });

describe('PATCH /people/:id', () => {

  it('Should update the person document', (done) => {
    var hexId = people[1]._id.toHexString();
    var nationalid = '1085111423'

    request(app)
      .patch(`/people/${hexId}`)
      .send({
        alive: false,
        nationalid
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.person.nationalid).toBe(nationalid);
        expect(res.body.person.alive).toBe(false);
        expect(res.body.person.deadAt).toBeA('number');
        done();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
      })
  });


  it('Should clear deadAt when person is alive', (done) => {
    var hexId = people[0]._id.toHexString();
    var nationalid = '10851112341 test'

    request(app)
      .patch(`/people/${hexId}`)
      .send({
        alive: true,
        nationalid
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.person.nationalid).toBe(nationalid);
        expect(res.body.person.alive).toBe(true);
        expect(res.body.person.deadAt).toNotExist();
        done();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
      })
  });
});

describe('GET /users/me', () => {
  it('Should return user if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });


  it('Should return a 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});


describe('POST /users', () => {
  it('Should create a user', (done) => {
    var email = 'example@example2.com';
    var password = '12345abcd';

    request(app)
      .post('/users')
      .send({email, password})
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toExist();
        expect(res.body._id).toExist();
        expect(res.body.email).toBe(email);
      })
      .end((err) => {
        if (err) {
          return done(err);
        }

        User.findOne({email}).then((user) => {
          expect(user).toExist();
          expect(user.password).toNotBe(password);
          done();
        });
      });
  });

  it('Should return validation errors if request invalid', (done) => {
    var email = 'asdasdasda';
    var password = '123';

    request(app)
      .post('/users')
      .send({email, password})
      .expect(400)
      .end(done);

  });

  it('Should not create user if email in use', (done) => {
    var email = 'Dohmi@example.com';
    var password = 'password2'

    request(app)
      .post('/users')
      .send({email, password})
      .expect(400)
      .end(done);
  });

});
