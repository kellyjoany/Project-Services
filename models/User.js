const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema({
  name: String,
  username: String,
  password: String,
  email: String,
  schedules: [{ type: Schema.Types.ObjectId, ref: 'Schedules' }],
  profile: { type: String, default: '1' },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
