const chai = require('chai');
const chaiHttp = require('chai-http');
const { describe, it } = require('mocha');
const app = require('../index');
const { Pool } = require('pg');

const URL = "postgres://mqpnptxk:RmLLPKHco0tZNR3p7pr0lhCc2BnJzhwQ@ella.db.elephantsql.com/mqpnptxk";

const pool = new Pool({
  connectionString: URL,
  ssl: {
    rejectUnauthorized: false, 
  },
});

chai.use(chaiHttp);
const expect = chai.expect;

describe('Tasks API Endpoints', () => {

  let taskId = 1; 

 it('should create a new task', (done) => {
  const newTask = {
        duedate: null,
        message: 'This is a test task',
        status: 'NOT DONE',
        reminder: null,
        senderurl: null,
        userid: 1740546703  
  };
  chai
    .request(app)
    .post('/tasks')
    .send(newTask)
    .end((err, res) => {
      if (err) return done(err);
      expect(res).to.have.status(201); 
      expect(res.body).to.be.an('object');
      expect(res.body.creationdate).to.not.equal(null);
      expect(res.body.duedate).to.equal(newTask.duedate);
      expect(res.body.message).to.equal(newTask.message);
      expect(res.body.status).to.equal(newTask.status);
      expect(res.body.reminder).to.equal(newTask.reminder);
      expect(res.body.senderurl).to.equal(newTask.senderurl);
      expect(res.body.userid).to.not.equal(null);
      done(); 
      taskId = res.body.taskid;
    });

 });

  it('should get a Task by ID', (done) => {
    chai
      .request(app)
      .get(`/tasks/${taskId}`) 
      .end((err, res) => {
        if (err) return done(err);
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        done(); 
        
      });
  });
  it('should delete created Task', (done) => {
    chai
        .request(app)
        .delete(`/tasks/${taskId}`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(200);
          done();
        });
  });


  it('should return a 404 status when an invalid task ID is provided', (done) => {
    const invalidTaskId = 999999; 
    chai
      .request(app)
      .get(`/tasks/${invalidTaskId}`)
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.body).to.have.property('error').to.equal('Task not found');
        done();
      });
  });

  it('should return a 500 status when an error occurs', (done) => {
    const taskIdWithError = 'badid'; 
    chai
      .request(app)
      .get(`/tasks/${taskIdWithError}`)
      .end((err, res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property('error').to.equal('Internal Server Error');
        done();
      });
  });
});
