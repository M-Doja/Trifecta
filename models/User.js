const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
  entries: [
    {
      subject: String,
      body: String,
      date: Date,
      time: Date,
      authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }
  ]
});


module.exports = mongoose.model('User', UserSchema);
