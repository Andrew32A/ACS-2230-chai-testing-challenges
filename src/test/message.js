require("dotenv").config();
const app = require("../server.js");
const mongoose = require("mongoose");
const chai = require("chai");
const chaiHttp = require("chai-http");
const assert = chai.assert;

const User = require("../models/user.js");
const Message = require("../models/message.js");

chai.config.includeStack = true;

const expect = chai.expect;
const should = chai.should();
chai.use(chaiHttp);

/**
 * root level hooks
 */
after((done) => {
  // required because https://github.com/Automattic/mongoose/issues/1251#issuecomment-65793092
  mongoose.models = {};
  mongoose.modelSchemas = {};
  mongoose.connection.close();
  done();
});

describe("Message API endpoints", () => {
  beforeEach((done) => {
    // TODO: add any beforeEach code here
    const sampleUser = new User({
        username: 'myuser',
        password: 'mypassword',
        _id: '6122d8c5cc7f26b02d1071a0'
    })
    sampleUser.save()
    .then(() => {
        done()
    })
  });

  afterEach((done) => {
    mongoose.connection.db
      .dropDatabase()
      .then(() => done())
      .catch((err) => done(err));
  });

  it("should load all messages", (done) => {
    const sampleMessage = new Message({
      title: "Sample message",
      body: "This is a sample message body",
      author: '6122d8c5cc7f26b02d1071a0',
    });
    sampleMessage.save().then(() => {
      chai
        .request(app)
        .get("/api/messages")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.messages.should.be.an("array");
          res.body.messages.should.have.lengthOf(1);
          done();
        });
    });
  });

  it("should get one specific message", (done) => {
    const sampleMessage = new Message({
      title: "Sample message",
      body: "This is a sample message body",
      author: '6122d8c5cc7f26b02d1071a0'
    });
    sampleMessage.save().then((savedMessage) => {
      chai
        .request(app)
        .get(`/api/messages/${savedMessage._id}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property("title").equal("Sample message");
          res.body.should.have
            .property("body")
            .equal("This is a sample message body");
          done();
        });
    });
  });

  it("should post a new message", (done) => {
    const newMessage = {
      title: "New message",
      body: "This is a new message body",
      author: '6122d8c5cc7f26b02d1071a0'
    };
    chai
      .request(app)
      .post("/api/messages")
      .send(newMessage)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("title").equal("New message");
        res.body.should.have
          .property("body")
          .equal("This is a new message body");
        res.body.should.have
          .property("author")
          .equal('6122d8c5cc7f26b02d1071a0'.toString());
        done();
      });
  });

  it("should update a message", (done) => {
    const updatedMessage = {
      text: "This is an updated message",
    };
    Message.findOne()
      .then((message) => {
        return chai
          .request(app)
          .put(`/messages/${message.id}`)
          .send(updatedMessage)
          .then((res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an("object");
            expect(res.body)
              .to.have.property("message")
              .equal(`Updated message with id ${message.id}`);
            expect(res.body)
              .to.have.property("data")
              .that.includes(updatedMessage);
            done();
          });
      })
      .catch((err) => {
        console.log(err);
        done(err);
      });
  });

  it("should delete a message", (done) => {
    Message.findOne()
      .then((message) => {
        return chai
          .request(app)
          .delete(`/messages/${message.id}`)
          .then((res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an("object");
            expect(res.body)
              .to.have.property("message")
              .equal(`Deleted message with id ${message.id}`);
            done();
          });
      })
      .catch((err) => {
        console.log(err);
        done(err);
      });
  });
});
