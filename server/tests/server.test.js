const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Person} = require('./../models/person');

const people = [{
  _id: new ObjectID(),
  nationalid: 'First test person'
}, {
  _id: new ObjectID(),
  nationalid: 'Second test person',
  alive: true,
  age: 20
}];

beforeEach((done) => {
  Person.remove({}).then(() => {
    return Person.insertMany(people);
  }).then(() => done());
});

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




  // it('should return 404 if person not found', (done) => {
  //   var hexId = new ObjectID().toHexString();
  //
  //   request(app)
  //     .get(`/people/${hexId}`)
  //     .expect(404)
  //     .end(done);
  // });
  //
  // it('should return 404 for non-object ids', (done) => {
  //   request(app)
  //     .get('/people/123abc')
  //     .expect(404)
  //     .end(done);
  // });
});
//
// describe('DELETE /people/:id', () => {
//   it('should remove a person', (done) => {
//     var hexId = people[1]._id.toHexString();
//
//     request(app)
//       .delete(`/people/${hexId}`)
//       .expect(200)
//       .expect((res) => {
//         expect(res.body.person._id).toBe(hexId);
//       })
//       .end((err, res) => {
//         if (err) {
//           return done(err);
//         }
//
//         Person.findById(hexId).then((person) => {
//           expect(person).toNotExist();
//           done();
//         }).catch((e) => done(e));
//       });
//   });
//
//   it('should return 404 if person not found', (done) => {
//     var hexId = new ObjectID().toHexString();
//
//     request(app)
//       .delete(`/people/${hexId}`)
//       .expect(404)
//       .end(done);
//   });
//
//   it('should return 404 if object id is invalid', (done) => {
//     request(app)
//       .delete('/people/123abc')
//       .expect(404)
//       .end(done);
//   });
// });
//
// describe('PATCH /people/:id', () => {
//   it('should update the person', (done) => {
//     var hexId = people[0]._id.toHexString();
//     var nationalid = 'This should be the new nationalid';
//
//     request(app)
//       .patch(`/people/${hexId}`)
//       .send({
//         completed: true,
//         nationalid
//       })
//       .expect(200)
//       .expect((res) => {
//         expect(res.body.person.nationalid).toBe(nationalid);
//         expect(res.body.person.completed).toBe(true);
//         expect(res.body.person.completedAt).toBeA('number');
//       })
//       .end(done);
//   });
//
//   it('should clear completedAt when person is not completed', (done) => {
//     var hexId = people[1]._id.toHexString();
//     var nationalid = 'This should be the new nationalid!!';
//
//     request(app)
//       .patch(`/people/${hexId}`)
//       .send({
//         completed: false,
//         nationalid
//       })
//       .expect(200)
//       .expect((res) => {
//         expect(res.body.person.nationalid).toBe(nationalid);
//         expect(res.body.person.completed).toBe(false);
//         expect(res.body.person.completedAt).toNotExist();
//       })
//       .end(done);
//   });
// });
