const mongoose = require('mongoose');

const ErrorDetailSchema = new mongoose.Schema({
  type: { type: String, required: true },
  description: { type: String, required: true }
});

const StatementSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  corrections: {
    type: [String],
    required: true
  },
  explanation: {
    type: String
  },
  errors: [ErrorDetailSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  suppressReservedKeysWarning: true
});

module.exports = mongoose.model('Statement', StatementSchema);
