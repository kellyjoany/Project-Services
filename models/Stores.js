const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema({
  name: String,
  address: String,
  number: String,
  district: String,
  city: String,
  state: String,
  zipCode: String,
  schedules: [{ type: Schema.Types.ObjectId, ref: 'Schedules' }],
});

const Stores = mongoose.model('Stores', userSchema);

module.exports = Stores;
