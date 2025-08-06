const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// JWT 토큰 생성
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// 회원가입
exports.register = async (req, res) => {
  try {
    // 유효성 검사 결과 확인
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    // 중복 확인
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(400).json({ error: '이미 사용 중인 사용자명입니다.' });
      }
      return res.status(400).json({ error: '이미 사용 중인 이메일입니다.' });
    }

    // 사용자 생성
    const user = new User({
      username,
      email,
      password
    });

    await user.save();

    // 토큰 생성
    const token = generateToken(user._id);

    res.status(201).json({
      message: '회원가입이 완료되었습니다.',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};

// 로그인
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // 사용자 찾기
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    // 비밀번호 확인
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    // 계정 활성화 확인
    if (!user.isActive) {
      return res.status(403).json({ error: '비활성화된 계정입니다.' });
    }

    // 토큰 생성
    const token = generateToken(user._id);

    res.json({
      message: '로그인되었습니다.',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};

// 현재 사용자 정보
exports.getMe = async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        createdAt: req.user.createdAt
      }
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};

// 비밀번호 변경
exports.changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    
    // 현재 비밀번호 확인
    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(currentPassword);
    
    if (!isMatch) {
      return res.status(401).json({ error: '현재 비밀번호가 올바르지 않습니다.' });
    }

    // 새 비밀번호 설정
    user.password = newPassword;
    await user.save();

    res.json({ message: '비밀번호가 변경되었습니다.' });
  } catch (error) {
    console.error('ChangePassword error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};

// 프로필 업데이트
exports.updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email } = req.body;
    const updates = {};

    if (username) updates.username = username;
    if (email) updates.email = email;

    // 중복 확인
    if (username || email) {
      const query = { _id: { $ne: req.user._id } };
      if (username) query.username = username;
      if (email) query.email = email;

      const existingUser = await User.findOne({
        $and: [
          { _id: { $ne: req.user._id } },
          { $or: Object.keys(query).filter(k => k !== '_id').map(k => ({ [k]: query[k] })) }
        ]
      });

      if (existingUser) {
        if (existingUser.username === username) {
          return res.status(400).json({ error: '이미 사용 중인 사용자명입니다.' });
        }
        return res.status(400).json({ error: '이미 사용 중인 이메일입니다.' });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: '프로필이 업데이트되었습니다.',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('UpdateProfile error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};
