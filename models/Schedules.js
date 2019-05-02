const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema({
  stores: { type: Schema.Types.ObjectId, ref: 'Stores' },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  bookingDay: String,
  bookingHour: String,
});

const Schedules = mongoose.model('Schedules', userSchema);

module.exports = Schedules;
