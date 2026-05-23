const mongoose = require('mongoose');

const SingleStatementCorrectionSchema = new mongoose.Schema({
  statementId: {
    type: String,
    required: true
  },
  originalText: {
    type: String,
    required: true
  },
  correctedText: {
    type: String,
    required: true
  },
  isCorrect: {
    type: Boolean,
    default: false
  }
});

const SubmissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  corrections: [SingleStatementCorrectionSchema],
  score: {
    type: Number,
    required: true
  },
  overallCorrect: {
    type: Boolean,
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Submission', SubmissionSchema);
