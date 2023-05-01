const express = require("express");
const router = express.Router();

const Message = require("../models/message");
const User = require("../models/user");


/** Route to get all messages. */
router.get('/', (req, res) => {
    Message.find().then((messages) => {
        return res.json({ messages })
    })
        .catch((err) => {
            throw err.message
        })
});

/** Route to get one message by id. */
router.get("/:messageId", (req, res) => {
  return res.send(`Message with id ${req.params.messageId}`);
});

/** Route to add a new message. */
router.post('/', (req, res) => {
    let message = new Message(req.body)
    message.save()
    .then(message => {
        return User.findById(message.author)
    })
    .then(user => {
        console.log(user)
        user.messages.unshift(message)
        return user.save()
    })
    .then(_ => {
        return res.send(message)
    }).catch(err => {
        return res.json()
    })
})

/** Route to update an existing message. */
router.put("/:messageId", (req, res) => {
  return res.send({
    message: `Update message with id ${req.params.messageId}`,
    data: req.body,
  });
});

/** Route to delete a message. */
router.delete("/:messageId", (req, res) => {
  return res.send(`Delete message with id ${req.params.messageId}`);
});

module.exports = router