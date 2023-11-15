const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required']
  },
  hash: {
    type: String,
    required: [true, 'Password is required']
  },
  salt: {
    type: String,
    required: true
  },
  created: {
    type: Date,
    required: [true, 'Created date is required']
  }
})

module.exports = userSchema;