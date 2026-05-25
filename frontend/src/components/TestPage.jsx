function TestPage({ statements = [], onStartTest }) {

  return (
    <div className="figma-centered-wrapper">

      <div className="figma-dark-card">

        <h2 className="figma-card-title">
          Test 1
        </h2>

        <div
          className="figma-statement-list"
          style={{ padding: '12px 0' }}
        >

          {(statements || []).map((sentence, idx) => (

            <div
              key={sentence._id || sentence.id || idx}
              className="figma-statement-item"
            >

              <p
                className="figma-statement-text"
                style={{
                  fontStyle: 'normal',
                  color: '#E2E8F0'
                }}
              >
                {sentence.text}
              </p>

            </div>

          ))}

        </div>

        <button
          type="button"
          onClick={onStartTest}
          className="figma-pill-button"
          style={{
            alignSelf: 'center',
            marginTop: '8px'
          }}
        >
          EDIT
        </button>

      </div>

    </div>
  );
}

export default TestPage;