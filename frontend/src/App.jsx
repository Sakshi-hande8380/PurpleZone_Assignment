import React, { useEffect, useState } from 'react';
import { Sparkles, LogOut } from 'lucide-react';
import AuthPage from './components/AuthPage';
import TestPage from './components/TestPage';
import EditPage from './components/EditPage';
import ResultPage from './components/ResultPage';

const DEFAULT_BACKEND_URL = 'http://localhost:5002';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002/api';

// Seed questions for absolute local fallback
const localStatementsSeed = [
  {
    id: "s1",
    text: "she dont have any idea how to fix it.",
    explanation: "Capitalize the first word 'She', use correct agreement 'doesn't' or 'does not' instead of 'dont', and end with a period.",
    errors: [
      { type: "capitalization", description: "Capitalize the first letter of the sentence ('she' -> 'She')." },
      { type: "grammar", description: "Use 'doesn't' or 'does not' instead of 'dont'." },
      { type: "punctuation", description: "Sentences must end with a period ('.')." }
    ]
  },
  {
    id: "s2",
    text: "the dogs chased it's tail around in circles.",
    explanation: "Capitalize the first word 'The', use correct possessive pronoun 'their' instead of 'it's', and end with a period.",
    errors: [
      { type: "capitalization", description: "Capitalize the first letter of the sentence ('the' -> 'The')." },
      { type: "grammar", description: "Use possessive 'their' instead of contraction 'it's' to match the plural subject 'dogs'." },
      { type: "punctuation", description: "Sentences must end with a period ('.')." }
    ]
  },
  {
    id: "s3",
    text: "we should of gone to the store earlier.",
    explanation: "Capitalize the first word 'We', use helper verb 'have' instead of preposition 'of' ('should have'), and end with a period.",
    errors: [
      { type: "capitalization", description: "Capitalize the first letter of the sentence ('we' -> 'We')." },
      { type: "grammar", description: "Use helper verb 'have' instead of preposition 'of'." },
      { type: "punctuation", description: "Sentences must end with a period ('.')." }
    ]
  }
];

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('auth'); // 'auth' | 'test' | 'edit' | 'result'
  const [statements, setStatements] = useState([]);
  const [currentCorrections, setCurrentCorrections] = useState({}); // { [id]: "corrected string" }
  const [gradingResult, setGradingResult] = useState(null);
  
  // Connection states
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  // 1. Detect if Express backend is online on mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const backendBaseUrl = import.meta.env.VITE_API_BASE_URL
          ? import.meta.env.VITE_API_BASE_URL.replace(/\/api$/, '')
          : DEFAULT_BACKEND_URL;
        const res = await fetch(`${backendBaseUrl}/`, { signal: AbortSignal.timeout(2000) });
        if (res.ok) {
          setIsBackendOnline(true);
          console.log("Connected successfully to PurpleZone Express backend server!");
        } else {
          setIsBackendOnline(false);
        }
      } catch (err) {
        setIsBackendOnline(false);
        console.warn("Backend server not running. Running in Client-Side Fallover Mode (localStorage DB).");
      } finally {
        setLoading(false);
      }
    };
    checkBackend();
  }, []);

  // 2. Load cached session from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('pz_user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      setPage('test');
      loadStatements(parsed.token);
    }
  }, [isBackendOnline]);

  // 3. Load Statements from Backend or Fallback local seeds
  const loadStatements = async (token) => {
    if (isBackendOnline) {
      try {
        const res = await fetch(`${API_BASE_URL}/statements`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setStatements(data);
          // Initialize empty corrections
          const initialCorrs = {};
          data.forEach(s => {
            initialCorrs[s._id || s.id] = '';
          });
          setCurrentCorrections(initialCorrs);
          return;
        }
      } catch (err) {
        console.error("Failed to load statements from API:", err);
      }
    }
    
    // Local Fallback if offline
    setStatements(localStatementsSeed);
    const initialCorrs = {};
    localStatementsSeed.forEach(s => {
      initialCorrs[s.id] = '';
    });
    setCurrentCorrections(initialCorrs);
  };

  // --- Auth Handlers ---
  const handleAuth = async (username, password, isRegister) => {
    setAuthError('');
    
    if (isBackendOnline) {
      try {
        const url = isRegister ? `${API_BASE_URL}/auth/register` : `${API_BASE_URL}/auth/login`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        
        if (res.ok) {
          setUser(data);
          localStorage.setItem('pz_user', JSON.stringify(data));
          setPage('test');
          loadStatements(data.token);
        } else {
          setAuthError(data.message || 'Authentication failed');
        }
        return;
      } catch (err) {
        console.error("Auth API failure:", err);
      }
    }

    // --- Local Mock Auth Fallback ---
    const localUsers = JSON.parse(localStorage.getItem('pz_users') || '[]');
    
    if (isRegister) {
      const exists = localUsers.find(u => u.username.toLowerCase() === username.toLowerCase());
      if (exists) {
        setAuthError('User already exists (Local Mode)');
        return;
      }
      const newUser = { id: `u_${Date.now()}`, username, password };
      localUsers.push(newUser);
      localStorage.setItem('pz_users', JSON.stringify(localUsers));
      
      const sessionUser = { _id: newUser.id, username: newUser.username, token: 'local_token_mock' };
      setUser(sessionUser);
      localStorage.setItem('pz_user', JSON.stringify(sessionUser));
      setPage('test');
      loadStatements('local_token_mock');
    } else {
      const match = localUsers.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
      if (!match) {
        // Create an automatic mock account for quick developer testing!
        if (username === 'testuser' && password === 'password123') {
          const sessionUser = { _id: 'u_test', username: 'testuser', token: 'local_token_mock' };
          setUser(sessionUser);
          localStorage.setItem('pz_user', JSON.stringify(sessionUser));
          setPage('test');
          loadStatements('local_token_mock');
        } else {
          setAuthError('Invalid credentials. Hint: use testuser / password123 or register.');
        }
        return;
      }
      const sessionUser = { _id: match.id, username: match.username, token: 'local_token_mock' };
      setUser(sessionUser);
      localStorage.setItem('pz_user', JSON.stringify(sessionUser));
      setPage('test');
      loadStatements('local_token_mock');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('pz_user');
    setPage('auth');
    setGradingResult(null);
  };

  // --- Submission & Grading Handler ---
  const handleSubmitCorrections = async (correctionsArray) => {
    // correctionsArray format: [{ statementId, correctedText }]
    if (isBackendOnline && user?.token !== 'local_token_mock') {
      try {
        const res = await fetch(`${API_BASE_URL}/statements/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify({ corrections: correctionsArray })
        });
        if (res.ok) {
          const data = await res.json();
          setGradingResult(data);
          setPage('result');
          return;
        }
      } catch (err) {
        console.error("Grading API error:", err);
      }
    }

    // --- Local Grading Fallback logic (Matches Backend Grammar Engine) ---
    let score = 0;
    const gradedList = correctionsArray.map(c => {
      const { statementId, correctedText } = c;
      const original = localStatementsSeed.find(s => s.id === statementId);
      
      const normInput = correctedText.trim().replace(/\s+/g, ' ');
      let isCorrect = false;
      let correctionsList = [];
      let explanation = original?.explanation || '';

      if (statementId === 's1' || statementId.toString().includes('s1')) {
        correctionsList = [
          "She doesn't have any idea how to fix it.",
          "She does not have any idea how to fix it."
        ];
      } else if (statementId === 's2' || statementId.toString().includes('s2')) {
        correctionsList = [
          "The dogs chased their tail around in circles.",
          "The dogs chased their tails around in circles."
        ];
      } else if (statementId === 's3' || statementId.toString().includes('s3')) {
        correctionsList = [
          "We should have gone to the store earlier."
        ];
      }

      isCorrect = correctionsList.some(ans => ans.trim().replace(/\s+/g, ' ') === normInput);
      if (isCorrect) score += 1;

      // Run rule engine
      const grammarAnalysis = [];
      if (statementId === 's1' || statementId.toString().includes('s1')) {
        grammarAnalysis.push({
          rule: "Capitalize the first letter of the sentence ('She')",
          passed: /^[S]he\b/.test(normInput),
          hint: "Make sure 'She' starts with a capital 'S'."
        });
        grammarAnalysis.push({
          rule: "Use correct singular subject agreement ('doesn't' or 'does not')",
          passed: /\b(doesn't|does not)\b/i.test(normInput) && /\b(doesn't|does not)\b/.test(normInput),
          hint: "Replace 'dont' with 'doesn't' or 'does not' (spelled exactly)."
        });
        grammarAnalysis.push({
          rule: "End the sentence with a period ('.')",
          passed: normInput.endsWith('.'),
          hint: "Add a period at the very end of the sentence."
        });
      } else if (statementId === 's2' || statementId.toString().includes('s2')) {
        grammarAnalysis.push({
          rule: "Capitalize the first letter of the sentence ('The')",
          passed: /^[T]he\b/.test(normInput),
          hint: "Make sure 'The' starts with a capital 'T'."
        });
        grammarAnalysis.push({
          rule: "Use correct plural possessive pronoun ('their')",
          passed: /\btheir\b/i.test(normInput) && /\btheir\b/.test(normInput),
          hint: "Replace the contraction 'it's' with possessive 'their' to match the plural 'dogs'."
        });
        grammarAnalysis.push({
          rule: "End the sentence with a period ('.')",
          passed: normInput.endsWith('.'),
          hint: "Add a period at the very end of the sentence."
        });
      } else if (statementId === 's3' || statementId.toString().includes('s3')) {
        grammarAnalysis.push({
          rule: "Capitalize the first letter of the sentence ('We')",
          passed: /^[W]e\b/.test(normInput),
          hint: "Make sure 'We' starts with a capital 'W'."
        });
        grammarAnalysis.push({
          rule: "Use helper verb 'have' instead of preposition 'of'",
          passed: /\bhave\b/i.test(normInput) && /\bhave\b/.test(normInput),
          hint: "Change 'should of' to 'should have'."
        });
        grammarAnalysis.push({
          rule: "End the sentence with a period ('.')",
          passed: normInput.endsWith('.'),
          hint: "Add a period at the very end of the sentence."
        });
      }

      return {
        statementId,
        originalText: original?.text || '',
        correctedText,
        isCorrect,
        explanation,
        grammarAnalysis
      };
    });

    const isAllCorrect = score === gradedList.length;
    const localResult = {
      submissionId: `sub_local_${Date.now()}`,
      score,
      totalStatements: gradedList.length,
      overallCorrect: isAllCorrect,
      corrections: gradedList,
      message: isAllCorrect
        ? "Congratulations! All statements are completely error-free."
        : `Some corrections were incorrect. You scored ${score} out of ${gradedList.length}.`,
      isLocalMode: true
    };

    setGradingResult(localResult);
    setPage('result');
  };

  if (loading) {
    return (
      <div className="ambient-bg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="logo-icon animate-pulse" style={{ margin: '0 auto 1.5rem', width: '3.5rem', height: '3.5rem' }}>
            <Sparkles color="white" size={24} />
          </div>
          <p style={{ color: 'hsl(var(--text-secondary))', fontWeight: 500 }}>Initializing PurpleZone...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="figma-app-bg">
      {/* Unified Corporate Header Bar */}
      <header 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '60px',
          background: '#ffffff',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2.5rem',
          zIndex: 1000
        }}
      >
        <div 
          className="logo-container" 
          style={{ cursor: 'pointer' }} 
          onClick={() => setPage(user ? 'test' : 'auth')}
        >
          <img 
            src="/purplezonewt 1.png" 
            alt="PurpleZone Logo" 
            style={{ 
              height: '24px', 
              width: 'auto',
              objectFit: 'contain'
            }} 
          />
        </div>

        {/* Connection & Auth Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#4A5568', fontWeight: 500 }}>
                Hi, <strong style={{ color: '#2D3748' }}>{user.username}</strong>
              </span>
              <button 
                onClick={handleLogout} 
                style={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.4rem 0.8rem', 
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  background: '#EDF2F7',
                  color: '#4A5568',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#E2E8F0'}
                onMouseLeave={(e) => e.target.style.background = '#EDF2F7'}
              >
                <LogOut size={13} />
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Content spacing to push main workspace below the fixed header */}
      <div style={{ height: '60px', width: '100%' }} />

      {/* View Router */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {page === 'auth' && (
          <AuthPage onSubmit={handleAuth} error={authError} />
        )}
        {page === 'test' && (
          <TestPage onStartTest={() => setPage('edit')} />
        )}
        {page === 'edit' && (
          <EditPage
            statements={statements}
            initialValues={currentCorrections}
            onBack={() => setPage('test')}
            onSubmit={handleSubmitCorrections}
          />
        )}
        {page === 'result' && (
          <ResultPage
            result={gradingResult}
            onRetry={() => setPage('edit')}
            onResetAll={() => {
              setGradingResult(null);
              setPage('test');
            }}
          />
        )}
      </main>
    </div>
  );
}
