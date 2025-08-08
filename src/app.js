const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// 환경 변수 설정
dotenv.config();

// Express 앱 생성
const app = express();

// 디버깅: 들어오는 Origin 로깅
app.use((req, res, next) => {
  if (req.headers.origin) {
    console.log('[REQ ORIGIN]', req.headers.origin, req.method, req.path);
  }
  next();
});

// 허용할 Origin 목록
const allowedOrigins = new Set([
  'http://localhost:3000',
  'http://forum-web.s3-website.ap-northeast-2.amazonaws.com',
]);

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.has(origin)) return callback(null, true);
    console.warn('[CORS BLOCK]', origin);
    return callback(new Error('CORS_NOT_ALLOWED'));
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Note: The cors() middleware above already handles OPTIONS preflight requests
// No need for a separate app.options() handler

app.use((err, req, res, next) => {
  if (err && err.message === 'CORS_NOT_ALLOWED') {
    return res.status(403).json({ error: 'CORS: Origin not allowed', origin: req.headers.origin });
  }
  next(err);
});

// Raw 요청 로깅 (필요 시 유지, 과도하면 나중에 제거)
app.use((req, res, next) => {
  console.log(`\n=== ${req.method} ${req.path} ===`);
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 라우트 임포트 (이미 CommonJS)
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');

app.get('/', (req, res) => {
  res.json({
    message: 'Forum API Server',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      posts: '/api/posts',
      comments: '/api/comments'
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);

app.use((req, res) => {
  res.status(404).json({ error: '요청한 리소스를 찾을 수 없습니다.' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({ error: `이미 사용 중인 ${field}입니다.` });
  }
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ error: '유효성 검사 실패', details: errors });
  }
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: '토큰이 만료되었습니다.' });
  }
  res.status(err.status || 500).json({ error: err.message || '서버 오류가 발생했습니다.' });
});

module.exports = app;
