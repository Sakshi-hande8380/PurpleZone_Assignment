const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB, getDbMode, getDbInfo } = require('./config/db');

dotenv.config();

const startApp = async () => {
  await connectDB();

  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/statements', require('./routes/statements'));

  app.get('/', (req, res) => {
    const dbStatus = getDbInfo();
    res.json({
      name: 'PurpleZone Grammar Checker API',
      version: '1.0.0',
      status: 'online',
      databaseMode: dbStatus.mode === 'mock' ? 'In-Memory / Mock DB Fallback' : 'MongoDB (Live Connection)',
      databaseHost: dbStatus.host,
      databaseName: dbStatus.name,
      endpoints: [
        { path: '/api/auth/register', method: 'POST', access: 'Public' },
        { path: '/api/auth/login', method: 'POST', access: 'Public' },
        { path: '/api/auth/me', method: 'GET', access: 'Private' },
        { path: '/api/statements', method: 'GET', access: 'Private' },
        { path: '/api/statements/submit', method: 'POST', access: 'Private' },
        { path: '/api/db/status', method: 'GET', access: 'Public' }
      ]
    });
  });

  app.get('/api/db/status', (req, res) => {
    const dbStatus = getDbInfo();
    res.json({
      databaseMode: dbStatus.mode === 'mock' ? 'In-Memory / Mock DB Fallback' : 'MongoDB (Live Connection)',
      databaseHost: dbStatus.host,
      databaseName: dbStatus.name,
      databaseUri: dbStatus.uri
    });
  });

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
      message: 'Something went wrong on the server',
      error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
  });

  const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 5000;
  const MAX_PORT_ATTEMPTS = 10;
  let currentPort = DEFAULT_PORT;

  const startServer = (port, attempt = 1) => {
    const server = app.listen(port, () => {
      console.log(`==================================================`);
      console.log(`PurpleZone Backend running on port ${port}`);
      console.log(`Database Mode: ${getDbMode() ? 'In-Memory / Mock DB Fallback' : 'MongoDB (Live Connection)'}`);
      console.log(`==================================================`);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.warn(`Port ${port} is already in use.`);
        if (attempt < MAX_PORT_ATTEMPTS) {
          const nextPort = port + 1;
          console.warn(`Trying port ${nextPort}...`);
          startServer(nextPort, attempt + 1);
        } else {
          console.error(`Unable to start server after ${MAX_PORT_ATTEMPTS} port attempts.`);
          process.exit(1);
        }
      } else {
        console.error('Server failed to start:', error);
        process.exit(1);
      }
    });
  };

  startServer(currentPort);
};

startApp();
