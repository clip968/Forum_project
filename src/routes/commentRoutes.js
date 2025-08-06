const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { authenticate, checkOwnership } = require('../middleware/auth');
const Comment = require('../models/Comment');
const {
  validateCreateComment,
  validateUpdateComment,
  validateMongoId,
  validatePostId,
  validatePagination
} = require('../middleware/validators');

// 게시글의 댓글 목록 조회
router.get('/post/:postId', validatePostId, validatePagination, commentController.getComments);

// 댓글 작성
router.post('/post/:postId', 
  validatePostId, 
  authenticate, 
  validateCreateComment, 
  commentController.createComment
);

// 내 댓글 목록
router.get('/my-comments', authenticate, validatePagination, commentController.getMyComments);

// 댓글 수정 (작성자 또는 관리자만)
router.put('/:id', 
  validateMongoId,
  authenticate, 
  checkOwnership(Comment), 
  validateUpdateComment, 
  commentController.updateComment
);

// 댓글 삭제 (작성자 또는 관리자만)
router.delete('/:id', 
  validateMongoId,
  authenticate, 
  checkOwnership(Comment), 
  commentController.deleteComment
);

// 댓글 좋아요
router.post('/:id/like', validateMongoId, authenticate, commentController.likeComment);

module.exports = router;
