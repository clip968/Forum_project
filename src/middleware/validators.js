const { body, param, query } = require('express-validator');

// 사용자 인증 관련
exports.validateRegister = [
  body('username')
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage('사용자명은 2-30자 사이여야 합니다.')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('사용자명은 영문, 숫자, 언더스코어만 사용 가능합니다.'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('유효한 이메일을 입력해주세요.')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('비밀번호는 최소 6자 이상이어야 합니다.')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다.')
];

exports.validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('유효한 이메일을 입력해주세요.')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('비밀번호를 입력해주세요.')
];

exports.validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('현재 비밀번호를 입력해주세요.'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('새 비밀번호는 최소 6자 이상이어야 합니다.')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('새 비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다.')
    .custom((value, { req }) => value !== req.body.currentPassword)
    .withMessage('새 비밀번호는 현재 비밀번호와 달라야 합니다.')
];

exports.validateUpdateProfile = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage('사용자명은 2-30자 사이여야 합니다.')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('사용자명은 영문, 숫자, 언더스코어만 사용 가능합니다.'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('유효한 이메일을 입력해주세요.')
    .normalizeEmail()
];

// 게시글 관련
exports.validateCreatePost = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('제목을 입력해주세요.')
    .isLength({ max: 200 })
    .withMessage('제목은 200자를 초과할 수 없습니다.'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('내용을 입력해주세요.')
    .isLength({ min: 10 })
    .withMessage('내용은 최소 10자 이상이어야 합니다.'),
  body('category')
    .optional()
    .isIn(['general', 'tech', 'discussion', 'question', 'announcement'])
    .withMessage('유효한 카테고리를 선택해주세요.'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('태그는 배열 형태여야 합니다.')
    .custom(tags => tags.every(tag => typeof tag === 'string' && tag.length <= 20))
    .withMessage('각 태그는 20자를 초과할 수 없습니다.')
];

exports.validateUpdatePost = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('제목을 입력해주세요.')
    .isLength({ max: 200 })
    .withMessage('제목은 200자를 초과할 수 없습니다.'),
  body('content')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('내용을 입력해주세요.')
    .isLength({ min: 10 })
    .withMessage('내용은 최소 10자 이상이어야 합니다.'),
  body('category')
    .optional()
    .isIn(['general', 'tech', 'discussion', 'question', 'announcement'])
    .withMessage('유효한 카테고리를 선택해주세요.'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('태그는 배열 형태여야 합니다.')
    .custom(tags => tags.every(tag => typeof tag === 'string' && tag.length <= 20))
    .withMessage('각 태그는 20자를 초과할 수 없습니다.')
];

// 댓글 관련
exports.validateCreateComment = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('댓글 내용을 입력해주세요.')
    .isLength({ max: 1000 })
    .withMessage('댓글은 1000자를 초과할 수 없습니다.'),
  body('parentComment')
    .optional()
    .isMongoId()
    .withMessage('유효한 부모 댓글 ID가 아닙니다.')
];

exports.validateUpdateComment = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('댓글 내용을 입력해주세요.')
    .isLength({ max: 1000 })
    .withMessage('댓글은 1000자를 초과할 수 없습니다.')
];

// ID 검증
exports.validateMongoId = [
  param('id')
    .isMongoId()
    .withMessage('유효한 ID가 아닙니다.')
];

exports.validatePostId = [
  param('postId')
    .isMongoId()
    .withMessage('유효한 게시글 ID가 아닙니다.')
];

// 페이지네이션 검증
exports.validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('페이지는 1 이상의 정수여야 합니다.')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('제한은 1-100 사이의 정수여야 합니다.')
    .toInt(),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'views', 'likes'])
    .withMessage('유효한 정렬 기준이 아닙니다.'),
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('정렬 순서는 asc 또는 desc여야 합니다.')
];
