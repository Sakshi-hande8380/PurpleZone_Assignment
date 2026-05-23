import React, { useState, useEffect } from 'react';

function EditPage({ statements, initialValues, onBack, onSubmit }) {
  const [corrections, setCorrections] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Initialize form with initialValues or pre-populate with original text
  useEffect(() => {
    const defaultVals = {};
    statements.forEach(s => {
      const id = s._id || s.id;
      defaultVals[id] = initialValues[id] || s.text;
    });
    setCorrections(defaultVals);
  }, [statements, initialValues]);

  const handleChange = (id, val) => {
    setCorrections(prev => ({
      ...prev,
      [id]: val
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Format corrections: [{ statementId, correctedText }]
    const payload = Object.keys(corrections).map(id => ({
      statementId: id,
      correctedText: corrections[id]
    }));

    try {
      await onSubmit(payload);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="figma-centered-wrapper">
      <div className="figma-dark-card">
        {/* Title */}
        <h2 className="figma-card-title">Test 1</h2>

        {/* Input Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div className="figma-statement-list">
            {statements.map((s, index) => {
              const id = s._id || s.id;
              const currentText = corrections[id] || '';

              return (
                <div key={id} className="figma-statement-item" style={{ gap: '12px' }}>
                  {/* Original uncorrected text */}
                  <p className="figma-statement-text" style={{ fontStyle: 'normal', color: 'rgba(255, 255, 255, 0.7)' }}>
                    {s.text}
                  </p>

                  {/* Underline Correction Input */}
                  <input
                    type="text"
                    className="figma-dark-underline-input"
                    value={currentText}
                    onChange={(e) => handleChange(id, e.target.value)}
                    placeholder="Enter correction here"
                    disabled={submitting}
                    required
                  />
                </div>
              );
            })}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="figma-pill-button"
            style={{ alignSelf: 'center', marginTop: '16px' }}
            disabled={submitting}
          >
            {submitting ? 'SUBMITTING...' : 'SUBMIT'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditPage;
