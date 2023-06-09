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
      username: "myuser",
      password: "mypassword",
      _id: "6122d8c5cc7f26b02d1071a0",
    });

    const sampleMessage = new Message({
      _id: "6122d8c5cc7f26b02d1071a1",
      title: "sample title",
      body: "sample body",
      author: sampleUser._id,
    });

    Promise.all([sampleUser.save(), sampleMessage.save()])
      .then(() => {
        this.userID = sampleUser._id;
        this.messageID = sampleMessage._id;
        done();
      })
      .catch((err) => done(err));
  });

  afterEach((done) => {
    mongoose.connection.db
      .dropDatabase()
      .then(() => done())
      .catch((err) => done(err));
  });

  it("should load all messages", (done) => {
    Message.findOne({ _id: this.messageID }, (err, savedMessage) => {
      chai
        .request(app)
        .get("/messages")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.messages.should.be.an("array");
          res.body.messages.should.have.lengthOf(1);
          done();
        });
    }).catch((err) => done(err));
  });

  it("should get one specific message", (done) => {
    Message.findOne({ _id: this.messageID }, (err, savedMessage) => {
      chai
        .request(app)
        .get(`/messages/${savedMessage._id}`)
        .end((err, res) => {
          if (err) {
            done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("object");
          console.log("this is BODY", res.body);
          expect(res.body.title).to.deep.equal("sample title");
          expect(res.body.body).to.deep.equal("sample body");
          expect(res.body.author).to.deep.equal("6122d8c5cc7f26b02d1071a0");
          done();
        });
    });
  });

  it("should post a new message", (done) => {
    const newMessage = {
      title: "New message title",
      body: "New message body",
      author: this.userID,
    };

    chai
      .request(app)
      .post("/messages")
      .send(newMessage)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("object");
        res.body.should.have.property("title").equal("New message title");
        res.body.should.have.property("body").equal("New message body");
        res.body.should.have.property("author").equal(this.userID.toString());
        done();
      });
  });

  it("should update a message", (done) => {
    const updatedMessage = {
      title: "Updated message title",
      body: "Updated message body",
      author: this.userID,
    };

    chai
      .request(app)
      .put(`/messages/${this.messageID}`)
      .send(updatedMessage)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("object");
        res.body.should.have.property("title").equal("Updated message title");
        res.body.should.have.property("body").equal("Updated message body");
        res.body.should.have.property("author").equal(this.userID.toString());
        done();
      });
  });

  it('should delete a message', (done) => {
    // TODO: Complete this
    chai.request(app)
    .delete(`/messages/${this.messageID}`)
    .end((err, res) => {
      res.should.have.status(200)
      Message.findById(this.messageID, (err, message) => {
        expect(message).to.be.null
        done()
      });
    });
  });
});
