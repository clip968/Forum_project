const app = require('./src/app');
const mongoose = require('mongoose');
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// 데이터베이스 연결 후 서버 시작
const startServer = async () => {
  try {
    if (MONGO_URI) {
      await mongoose.connect(MONGO_URI);
      console.log('MongoDB connected');
    } else {
      console.warn('MONGO_URI not set');
    }

    // 서버 시작
    app.listen(PORT, '127.0.0.1', () => {
      console.log(`API server running on http://127.0.0.1:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// 프로세스 종료 시 정리
process.on('SIGINT', () => {
  console.log('Graceful shutdown');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Graceful shutdown');
  process.exit(0);
});
