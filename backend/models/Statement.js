const mongoose = require('mongoose');

const ErrorDetailSchema = new mongoose.Schema({
  type: { type: String, required: true },
  description: { type: String, required: true }
});


const StatementSchema = new mongoose.Schema({

  text: {
    type: String,
    required: true
  },

  explanation: {
    type: String,
    required: true
  },

  correctAnswer: {
    type: String,
    default: ''
  },

  corrections: {
    type: [String],
    default: []
  },

  errors: {
    type: [ErrorDetailSchema],
    default: []
  }

});

module.exports = mongoose.models.Statement || mongoose.model('Statement', StatementSchema);