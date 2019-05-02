const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema({
  name: String,
  nameStore: String,
  username: String,
  password: String,
  email: String,
  stores: [{ type: Schema.Types.ObjectId, ref: 'Stores' }],
  profile: { type: String, default: '2' },
});

const Manager = mongoose.model('Manager', userSchema);

module.exports = Manager;
