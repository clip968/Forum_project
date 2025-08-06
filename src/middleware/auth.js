const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT 토큰 검증 미들웨어
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      throw new Error();
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
  }
};

// 선택적 인증 미들웨어 (로그인하지 않아도 접근 가능하지만, 로그인 정보가 있으면 추가)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
        req.token = token;
      }
    }
    next();
  } catch (error) {
    // 토큰이 유효하지 않아도 계속 진행
    next();
  }
};

// 권한 확인 미들웨어
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: '권한이 없습니다.' });
    }

    next();
  };
};

// 리소스 소유자 확인 미들웨어
const checkOwnership = (model, paramName = 'id') => {
  return async (req, res, next) => {
    try {
      const resource = await model.findById(req.params[paramName]);
      
      if (!resource) {
        return res.status(404).json({ error: '리소스를 찾을 수 없습니다.' });
      }

      // 관리자는 모든 리소스에 접근 가능
      if (req.user.role === 'admin') {
        req.resource = resource;
        return next();
      }

      // 소유자 확인
      const authorField = resource.author || resource.user;
      if (!authorField || authorField.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: '권한이 없습니다.' });
      }

      req.resource = resource;
      next();
    } catch (error) {
      res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
  };
};

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  checkOwnership
};
