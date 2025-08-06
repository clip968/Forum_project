const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { authenticate, optionalAuth, authorize, checkOwnership } = require('../middleware/auth');
const Post = require('../models/Post');
const {
  validateCreatePost,
  validateUpdatePost,
  validateMongoId,
  validatePagination
} = require('../middleware/validators');

// 게시글 목록 조회 (로그인 불필요)
router.get('/', validatePagination, optionalAuth, postController.getPosts);

// 내 게시글 목록
router.get('/my-posts', authenticate, validatePagination, postController.getMyPosts);

// 게시글 상세 조회 (로그인 불필요)
router.get('/:id', validateMongoId, optionalAuth, postController.getPost);

// 게시글 작성 (로그인 필요)
router.post('/', authenticate, validateCreatePost, postController.createPost);

// 게시글 수정 (작성자 또는 관리자만)
router.put('/:id', 
  validateMongoId,
  authenticate, 
  checkOwnership(Post), 
  validateUpdatePost, 
  postController.updatePost
);

// 게시글 삭제 (작성자 또는 관리자만)
router.delete('/:id', 
  validateMongoId,
  authenticate, 
  checkOwnership(Post), 
  postController.deletePost
);

// 게시글 좋아요 (로그인 필요)
router.post('/:id/like', validateMongoId, authenticate, postController.likePost);

// 게시글 고정 (관리자/모더레이터만)
router.post('/:id/pin', 
  validateMongoId, 
  authenticate, 
  authorize('admin', 'moderator'), 
  postController.pinPost
);

// 게시글 잠금 (관리자/모더레이터만)
router.post('/:id/lock', 
  validateMongoId, 
  authenticate, 
  authorize('admin', 'moderator'), 
  postController.lockPost
);

module.exports = router;
