const Statement = require('../models/Statement');
const Submission = require('../models/Submission');
const { getDbMode } = require('../config/db');
const mockDb = require('../models/mockDb');

const normalizeText = (text) => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text
    .trim()
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .toLowerCase();
};

const analyzeGrammar = (originalText, correctedText) => {
  const feedback = [];
  const original = normalizeText(originalText);
  const corrected = normalizeText(correctedText);

  if (original.includes('dont') || original.includes('weekends')) {
    feedback.push({
      rule: 'Use correct helping verb',
      passed: corrected.includes("doesn't") || corrected.includes('does not'),
      hint: "Replace 'dont' with 'doesn't'"
    });
    feedback.push({
      rule: 'Use singular noun',
      passed: corrected.includes('every weekend'),
      hint: "Replace 'weekends' with 'weekend'"
    });
  }

  if (original.includes('forgot buy') || original.includes('market')) {
    feedback.push({
      rule: 'Use article before market',
      passed: corrected.includes('the market'),
      hint: "Use 'the market'"
    });
    feedback.push({
      rule: 'Use infinitive verb',
      passed: corrected.includes('to buy'),
      hint: "Use 'to buy'"
    });
  }

  if (original.includes('was happy') || original.includes('there project')) {
    feedback.push({
      rule: 'Use plural helping verb',
      passed: corrected.includes('were happy'),
      hint: "Use 'were happy'"
    });
    feedback.push({
      rule: 'Use correct possessive pronoun',
      passed: corrected.includes('their project'),
      hint: "Replace 'there' with 'their'"
    });
  }

  feedback.push({
    rule: 'Sentence should start with capital letter',
    passed: /^[A-Z]/.test(correctedText?.trim()),
    hint: 'Capitalize first letter'
  });

  feedback.push({
    rule: 'Sentence should end with period',
    passed: correctedText?.trim().endsWith('.'),
    hint: 'Add period at end'
  });

  return feedback;
};

exports.getStatements = async (req, res) => {
  try {
    const isMock = getDbMode();

    if (isMock) {
      const safeStatements = mockDb.statements.map((statement) => ({
        _id: statement.id,
        text: statement.text
      }));
      return res.status(200).json(safeStatements);
    }

    const statements = await Statement.find({}, { correctAnswer: 0, __v: 0 });
    return res.status(200).json(statements);
  } catch (error) {
    console.error('getStatements error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving statements'
    });
  }
};

exports.submitCorrections = async (req, res) => {
  try {
    const { corrections } = req.body;

    if (!corrections || !Array.isArray(corrections) || corrections.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide corrections'
      });
    }

    const isMock = getDbMode();
    let score = 0;
    const gradedCorrections = [];
    const submissionCorrections = [];

    for (const item of corrections) {
      const statementId = item.statementId;
      const correctedText = item.correctedText;

      if (!statementId || !correctedText) {
        gradedCorrections.push({
          statementId,
          correctedText,
          isCorrect: false,
          message: 'Invalid correction data'
        });
        continue;
      }

      let statement = null;
      if (isMock) {
        statement = mockDb.statements.find(
          (s) => s.id.toString() === statementId.toString()
        );
      } else {
        statement = await Statement.findById(statementId);
      }

      if (!statement) {
        gradedCorrections.push({
          statementId,
          correctedText,
          isCorrect: false,
          message: 'Statement not found'
        });
        continue;
      }

      const originalText = statement.text;
      const correctAnswer = statement.correctAnswer || (statement.corrections || [])[0] || '';
      const acceptedAnswers = [
        ...(statement.correctAnswer ? [statement.correctAnswer] : []),
        ...(Array.isArray(statement.corrections) ? statement.corrections : [])
      ].filter(Boolean);

      const isCorrect = acceptedAnswers.some(
        (answer) => normalizeText(answer) === normalizeText(correctedText)
      );

      if (isCorrect) {
        score++;
      }

      const grammarAnalysis = analyzeGrammar(originalText, correctedText);

      submissionCorrections.push({
        statementId,
        originalText,
        correctedText,
        isCorrect
      });

      gradedCorrections.push({
        statementId,
        originalText,
        correctedText,
        correctAnswer,
        isCorrect,
        grammarAnalysis
      });
    }

    const overallCorrect = score === corrections.length;

    if (!isMock) {
      try {
        const userId = req.user?.id || req.user?._id;

        if (!userId) {
          console.error('User ID missing in req.user');
        } else {
          await Submission.create({
            user: userId,
            corrections: submissionCorrections,
            score,
            overallCorrect,
            submittedAt: new Date()
          });
        }
      } catch (saveErr) {
        console.error('Failed to save submission:', saveErr);
      }
    }

    return res.status(200).json({
      success: true,
      score,
      totalStatements: corrections.length,
      overallCorrect,
      corrections: gradedCorrections,
      message: overallCorrect
        ? 'All statements corrected successfully!'
        : `You scored ${score} out of ${corrections.length}`
    });
  } catch (error) {
    console.error('submitCorrections error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error processing corrections'
    });
  }
};
