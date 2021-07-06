const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    trim: true,
    required: 'Username is required',
    minlength: [4, 'Username must be at least 4 characters'],
    maxlength: [32, 'Username max length is 32 characters'],
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    required: 'Email is required',
    minlength: [4, 'Email must be at least 4 characters'],
    maxlength: [32, 'Email max length is 32 characters'],
    match:
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  },
  password: {
    type: String,
    trim: true,
    required: 'Password is required',
    minlength: [6, 'Password must be at least 6 characters'],
    maxlength: [32, 'Password max length is 32 characters'],
  },
});

userSchema.statics.sendError = function (res, config) {
  const { status, message } = config;

  return res.status(status).json({
    errors: [{ title: 'User Error!', message }],
  });
};

module.exports = mongoose.model('User', userSchema);