const request = require('supertest');
const { expect } = require('chai');
const app = require('../index'); 

describe('Users API Endpoints', () => {
 
  let userId = 1;
  it('should create a new user', (done) => {
    const newUser = {
      telegramid: '1234567890',
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'password123',
    };
    request(app)
      .post('/users')
      .send(newUser)
      .expect(201) 
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.be.an('object');
        expect(res.body.telegramid).to.equal(newUser.telegramid);
        done(); 
        userId = res.body.userid;
      });
  });
  it('should get a list of users', (done) => {
    request(app)
      .get('/users')
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.be.an('array');
        done(); 
      });
  });

  it('should get a user by ID', (done) => {
    request(app)
      .get(`/users/${userId}`) 
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.be.an('object');
        done(); 
        
      });
  });

  it('should delete created user', (done) => {

    request(app)
        .delete(`/users/${userId}`)
        .expect(200) 
        .end((err, res) => {
          if (err) return done(err);
          done();
        });

  });

});
