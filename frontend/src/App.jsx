import { useEffect, useState } from 'react';
import { Sparkles, LogOut } from 'lucide-react';

import AuthPage from './components/AuthPage';
import TestPage from './components/TestPage';
import EditPage from './components/EditPage';
import ResultPage from './components/ResultPage';

const DEFAULT_BACKEND_URL = 'http://localhost:5002';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:5002/api';

// Local fallback statements
const localStatementsSeed = [
  {
    id: 's1',
    text: 'she dont have any idea how to fix it.',
    explanation:
      "Capitalize the first word 'She', use correct agreement 'doesn't', and end with a period."
  },
  {
    id: 's2',
    text: "the dogs chased it's tail around in circles.",
    explanation:
      "Capitalize 'The' and replace it's with their."
  },
  {
    id: 's3',
    text: 'we should of gone to the store earlier.',
    explanation:
      "Replace 'should of' with 'should have'."
  }
];

export default function App() {

  const [user, setUser] = useState(null);

  const [page, setPage] = useState('auth');

  const [statements, setStatements] = useState([]);

  const [currentCorrections, setCurrentCorrections] = useState({});

  const [gradingResult, setGradingResult] = useState(null);

  const [isBackendOnline, setIsBackendOnline] = useState(false);

  const [loading, setLoading] = useState(true);

  const [authError, setAuthError] = useState('');

  // ======================================================
  // CHECK BACKEND CONNECTION
  // ======================================================

  useEffect(() => {

    const checkBackend = async () => {

      try {

        const backendBaseUrl =
          import.meta.env.VITE_API_BASE_URL
            ? import.meta.env.VITE_API_BASE_URL.replace('/api', '')
            : DEFAULT_BACKEND_URL;

        const res = await fetch(`${backendBaseUrl}/`);

        if (res.ok) {

          setIsBackendOnline(true);

          console.log('Backend Connected');

        } else {

          setIsBackendOnline(false);
        }

      } catch  {

        console.warn('Backend Offline');

        setIsBackendOnline(false);

      } finally {

        setLoading(false);
      }
    };

    checkBackend();

  }, []);
   const loadStatements = async (token) => {

    // ONLINE MODE
    if (isBackendOnline) {

      try {

        const res = await fetch(
          `${API_BASE_URL}/statements`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (res.ok) {

          const data = await res.json();

          setStatements(data);

          const initialCorrections = {};

          data.forEach((statement) => {

            initialCorrections[
              statement._id || statement.id
            ] = '';

          });

          setCurrentCorrections(initialCorrections);

          return;
        }

      } catch (err) {

        console.error(
          'Failed loading statements',
          err
        );
      }
    }

    // OFFLINE MODE
    setStatements(localStatementsSeed);

    const localCorrections = {};

    localStatementsSeed.forEach((statement) => {

      localCorrections[statement.id] = '';

    });

    setCurrentCorrections(localCorrections);
  };
  // ======================================================
  // LOAD USER SESSION
  // ======================================================

  useEffect(() => {

  const restoreSession = async () => {

    const storedUser =
      localStorage.getItem('pz_user');

    if (!storedUser) return;

    const parsedUser =
      JSON.parse(storedUser);

    setUser(parsedUser);

    setPage('test');

    await loadStatements(parsedUser.token);
  };

  restoreSession();

}, [isBackendOnline]);

  // ======================================================
  // LOAD STATEMENTS
  // ======================================================



  // ======================================================
  // AUTH HANDLER
  // ======================================================

  const handleAuth = async (
    username,
    password,
    isRegister
  ) => {

    setAuthError('');

    // ==========================
    // BACKEND AUTH
    // ==========================

    if (isBackendOnline) {

      try {

        const url = isRegister
          ? `${API_BASE_URL}/auth/register`
          : `${API_BASE_URL}/auth/login`;

        const res = await fetch(url, {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({
            username,
            password
          })
        });

        const data = await res.json();

        if (res.ok) {

          setUser(data);

          localStorage.setItem(
            'pz_user',
            JSON.stringify(data)
          );

          setPage('test');

          loadStatements(data.token);

        } else {

          setAuthError(
            data.message || 'Authentication Failed'
          );
        }

        return;

      } catch (err) {

        console.error(err);
      }
    }

    // ==========================
    // LOCAL MOCK AUTH
    // ==========================

    const localUsers = JSON.parse(
      localStorage.getItem('pz_users') || '[]'
    );

    if (isRegister) {

      const exists = localUsers.find(
        (u) =>
          u.username.toLowerCase() ===
          username.toLowerCase()
      );

      if (exists) {

        setAuthError('User already exists');

        return;
      }

      const newUser = {
        id: `u_${Date.now()}`,
        username,
        password
      };

      localUsers.push(newUser);

      localStorage.setItem(
        'pz_users',
        JSON.stringify(localUsers)
      );

      const sessionUser = {
        _id: newUser.id,
        username: newUser.username,
        token: 'local_token_mock'
      };

      setUser(sessionUser);

      localStorage.setItem(
        'pz_user',
        JSON.stringify(sessionUser)
      );

      setPage('test');

      loadStatements('local_token_mock');

    } else {

      const match = localUsers.find(
        (u) =>
          u.username.toLowerCase() ===
            username.toLowerCase() &&
          u.password === password
      );

      if (!match) {

        setAuthError(
          'Invalid credentials'
        );

        return;
      }

      const sessionUser = {
        _id: match.id,
        username: match.username,
        token: 'local_token_mock'
      };

      setUser(sessionUser);

      localStorage.setItem(
        'pz_user',
        JSON.stringify(sessionUser)
      );

      setPage('test');

      loadStatements('local_token_mock');
    }
  };

  // ======================================================
  // LOGOUT
  // ======================================================

  const handleLogout = () => {

    setUser(null);

    localStorage.removeItem('pz_user');

    setPage('auth');

    setGradingResult(null);
  };

  // ======================================================
  // SUBMIT CORRECTIONS
  // ======================================================

  const handleSubmitCorrections = async (
    correctionsArray
  ) => {

    if (
      isBackendOnline &&
      user?.token !== 'local_token_mock'
    ) {

      try {

        const res = await fetch(
          `${API_BASE_URL}/statements/submit`,
          {
            method: 'POST',

            headers: {
              'Content-Type': 'application/json',

              Authorization: `Bearer ${user.token}`
            },

            body: JSON.stringify({
              corrections: correctionsArray
            })
          }
        );

        if (res.ok) {

          const data = await res.json();

          setGradingResult(data);

          setPage('result');

          return;
        }

      } catch (err) {

        console.error(err);
      }
    }

    // LOCAL FALLBACK RESULT
    setGradingResult({
      score: 0,
      totalStatements: correctionsArray.length,
      corrections: correctionsArray,
      message: 'Local Mode Submission'
    });

    setPage('result');
  };

  // ======================================================
  // LOADING SCREEN
  // ======================================================

  if (loading) {

    return (

      <div
        className="ambient-bg"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh'
        }}
      >

        <div style={{ textAlign: 'center' }}>

          <div
            className="logo-icon animate-pulse"
            style={{
              margin: '0 auto 1.5rem',
              width: '3.5rem',
              height: '3.5rem'
            }}
          >

            <Sparkles
              color="white"
              size={24}
            />

          </div>

          <p
            style={{
              color:
                'hsl(var(--text-secondary))',
              fontWeight: 500
            }}
          >
            Initializing PurpleZone...
          </p>

        </div>

      </div>
    );
  }

  // ======================================================
  // MAIN UI
  // ======================================================

  return (

    <div className="figma-app-bg">

      {/* HEADER */}

      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '60px',
          background: '#ffffff',
          borderBottom:
            '1px solid rgba(0,0,0,0.06)',
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
          onClick={() =>
            setPage(user ? 'test' : 'auth')
          }
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

        {user && (

          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: '#EDF2F7',
              cursor: 'pointer'
            }}
          >

            <LogOut size={14} />

            Logout

          </button>
        )}

      </header>

      {/* HEADER SPACE */}

      <div
        style={{
          height: '60px'
        }}
      />

      {/* MAIN ROUTER */}

      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column'
        }}
      >

        {page === 'auth' && (

          <AuthPage
            onSubmit={handleAuth}
            error={authError}
          />
        )}

        {page === 'test' && (

          <TestPage
            statements={statements}
            onStartTest={() =>
              setPage('edit')
            }
          />
        )}

        {page === 'edit' && (

          <EditPage
            statements={statements}
            initialValues={currentCorrections}
            onBack={() =>
              setPage('test')
            }
            onSubmit={
              handleSubmitCorrections
            }
          />
        )}

        {page === 'result' && (

          <ResultPage
            result={gradingResult}
            onRetry={() =>
              setPage('edit')
            }
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