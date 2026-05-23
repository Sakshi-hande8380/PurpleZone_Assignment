import React from 'react';

const sentences = [
  "she dont have any idea how to fix it.",
  "the dogs chased it's tail around in circles.",
  "we should of gone to the store earlier."
];

function TestPage({ onStartTest }) {
  return (
    <div className="figma-centered-wrapper">
      <div className="figma-dark-card">
        {/* Title */}
        <h2 className="figma-card-title">Test 1</h2>

        {/* Statements List */}
        <div className="figma-statement-list" style={{ padding: '12px 0' }}>
          {sentences.map((sentence, idx) => (
            <div key={idx} className="figma-statement-item">
              <p className="figma-statement-text" style={{ fontStyle: 'normal', color: '#E2E8F0' }}>
                {sentence}
              </p>
            </div>
          ))}
        </div>

        {/* Start / Edit Button */}
        <button
          type="button"
          onClick={onStartTest}
          className="figma-pill-button"
          style={{ alignSelf: 'center', marginTop: '8px' }}
        >
          EDIT
        </button>
      </div>
    </div>
  );
}

export default TestPage;
