const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const {
  validateRegister,
  validateLogin,
  validateChangePassword,
  validateUpdateProfile
} = require('../middleware/validators');

// 회원가입
router.post('/register', validateRegister, authController.register);

// 로그인
router.post('/login', validateLogin, authController.login);

// 현재 사용자 정보
router.get('/me', authenticate, authController.getMe);

// 비밀번호 변경
router.post('/change-password', authenticate, validateChangePassword, authController.changePassword);

// 프로필 업데이트
router.put('/profile', authenticate, validateUpdateProfile, authController.updateProfile);

module.exports = router;
