const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// 환경 변수 설정
dotenv.config();

// Express 앱 생성
const app = express();
const allowedOrigins = [
  'http://localhost:3000',
  'http://kookmin-10-s3.s3-website-us-east-1.amazonaws.com'
];

// 미들웨어 설정
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Raw 요청 로깅 (JSON 파싱 전)
app.use((req, res, next) => {
  console.log(`\n=== ${req.method} ${req.path} ===`);
  console.log('Headers:', req.headers);
  console.log('Content-Type:', req.headers['content-type']);
  
  let rawBody = '';
  req.on('data', chunk => {
    rawBody += chunk.toString();
  });
  
  req.on('end', () => {
    console.log('Raw Body:', rawBody);
    console.log('Raw Body Length:', rawBody.length);
    console.log('Raw Body Type:', typeof rawBody);
    console.log('================================\n');
  });
  
  next();
});

app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf, encoding) => {
    console.log('JSON Verify - Buffer:', buf.toString());
    console.log('JSON Verify - Encoding:', encoding);
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 파싱된 데이터 로깅
app.use((req, res, next) => {
  console.log('Parsed Body:', req.body);
  console.log('Body Type:', typeof req.body);
  next();
});

// 라우트 임포트
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');

// 기본 라우트
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

// API 라우트 설정
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);

// 404 에러 핸들러
app.use((req, res, next) => {
  res.status(404).json({ error: '요청한 리소스를 찾을 수 없습니다.' });
});

// 글로벌 에러 핸들러
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // MongoDB 중복 키 에러
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({ 
      error: `이미 사용 중인 ${field}입니다.` 
    });
  }
  
  // Mongoose 유효성 검사 에러
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ 
      error: '유효성 검사 실패', 
      details: errors 
    });
  }
  
  // JWT 에러
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: '토큰이 만료되었습니다.' });
  }
  
  // 기본 에러
  res.status(err.status || 500).json({ 
    error: err.message || '서버 오류가 발생했습니다.' 
  });
});

module.exports = app;
