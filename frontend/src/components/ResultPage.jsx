import React from 'react';

function ResultPage({ result, onRetry, onResetAll }) {
  if (!result) return null;

  const { score, totalStatements, overallCorrect, corrections } = result;

  // Retrieve username from localStorage to show in the greeting
  const storedUser = localStorage.getItem('pz_user');
  const username = storedUser ? JSON.parse(storedUser).username : 'user';

  return (
    <div className="figma-centered-wrapper">
      <div className="figma-dark-card">
        {/* Title */}
        <h2 className="figma-success-text" style={{ fontSize: '1.45rem', textTransform: 'none' }}>
          Congratulations, {username}
        </h2>

        {/* Graded Statements List */}
        <div className="figma-statement-list">
          {corrections.map((c, index) => (
            <div key={c.statementId || index} className="figma-result-row">
              {/* Corrected Text display */}
              <p className="figma-statement-text" style={{ fontStyle: 'normal', color: '#FFFFFF', flex: 1 }}>
                {c.correctedText}
              </p>

              {/* Success / Error Icon badge from assets */}
              <img
                src={c.isCorrect ? '/Group 3.png' : '/Group 5.png'}
                alt={c.isCorrect ? 'Correct' : 'Incorrect'}
                className="figma-result-icon"
              />
            </div>
          ))}
        </div>

        {/* Score Feedback */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginTop: '12px' }}>
          <p className="figma-success-text" style={{ fontSize: '1.05rem', textTransform: 'none' }}>
            You successfully corrected {score}/{totalStatements} errors.
          </p>

          {/* Retry / Reset Options for Development and UX convenience */}
          <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
            <button
              onClick={onRetry}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.45)',
                fontSize: '0.82rem',
                fontWeight: 600,
                textDecoration: 'underline',
                cursor: 'pointer',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = 'white'}
              onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.45)'}
            >
              Fix Errors
            </button>
            <button
              onClick={onResetAll}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.45)',
                fontSize: '0.82rem',
                fontWeight: 600,
                textDecoration: 'underline',
                cursor: 'pointer',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = 'white'}
              onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.45)'}
            >
              Reset Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResultPage;
