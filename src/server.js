const app = require('./app');
const connectDB = require('./config/database');

const PORT = process.env.PORT || 5000;

// 데이터베이스 연결 후 서버 시작
const startServer = async () => {
  try {
    // MongoDB 연결
    await connectDB();
    
    // 서버 시작
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
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
  console.log('\nServer is shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nServer is shutting down...');
  process.exit(0);
});
