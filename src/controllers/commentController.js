const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { validationResult } = require('express-validator');

// 댓글 작성
exports.createComment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, parentComment } = req.body;
    const postId = req.params.postId;

    // 게시글 확인
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
    }

    // 잠긴 게시글 확인
    if (post.isLocked) {
      return res.status(403).json({ error: '잠긴 게시글에는 댓글을 작성할 수 없습니다.' });
    }

    // 대댓글인 경우 부모 댓글 확인
    if (parentComment) {
      const parent = await Comment.findById(parentComment);
      if (!parent || parent.post.toString() !== postId) {
        return res.status(400).json({ error: '유효하지 않은 부모 댓글입니다.' });
      }
    }

    const comment = new Comment({
      content,
      author: req.user._id,
      post: postId,
      parentComment
    });

    await comment.save();
    await comment.populate('author', 'username');

    res.status(201).json({
      message: '댓글이 작성되었습니다.',
      comment
    });
  } catch (error) {
    console.error('CreateComment error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};

// 댓글 목록 조회
exports.getComments = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const postId = req.params.postId;

    // 최상위 댓글만 가져오기 (대댓글은 populate로)
    const comments = await Comment.find({ 
      post: postId, 
      parentComment: null,
      isDeleted: false 
    })
      .populate('author', 'username')
      .populate({
        path: 'replies',
        match: { isDeleted: false },
        populate: { path: 'author', select: 'username' }
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Comment.countDocuments({ 
      post: postId, 
      parentComment: null,
      isDeleted: false 
    });

    res.json({
      comments,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('GetComments error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};

// 댓글 수정
exports.updateComment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const comment = req.resource; // checkOwnership 미들웨어에서 설정
    const { content } = req.body;

    // 수정 이력 저장
    if (content !== comment.content) {
      comment.editHistory.push({
        previousContent: comment.content
      });
      comment.content = content;
      comment.isEdited = true;
    }

    await comment.save();
    await comment.populate('author', 'username');

    res.json({
      message: '댓글이 수정되었습니다.',
      comment
    });
  } catch (error) {
    console.error('UpdateComment error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};

// 댓글 삭제 (소프트 삭제)
exports.deleteComment = async (req, res) => {
  try {
    const comment = req.resource;

    // 대댓글이 있는지 확인
    const hasReplies = await Comment.exists({ 
      parentComment: comment._id,
      isDeleted: false 
    });

    if (hasReplies) {
      // 대댓글이 있으면 내용만 삭제 표시
      comment.content = '[삭제된 댓글입니다]';
      comment.isDeleted = true;
      await comment.save();
    } else {
      // 대댓글이 없으면 완전 삭제
      await comment.deleteOne();
    }

    res.json({ message: '댓글이 삭제되었습니다.' });
  } catch (error) {
    console.error('DeleteComment error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};

// 댓글 좋아요
exports.likeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ error: '댓글을 찾을 수 없습니다.' });
    }

    const userIndex = comment.likes.indexOf(req.user._id);
    
    if (userIndex > -1) {
      // 이미 좋아요한 경우 - 취소
      comment.likes.splice(userIndex, 1);
      await comment.save();
      res.json({ message: '좋아요가 취소되었습니다.', likesCount: comment.likes.length });
    } else {
      // 좋아요 추가
      comment.likes.push(req.user._id);
      await comment.save();
      res.json({ message: '좋아요를 눌렀습니다.', likesCount: comment.likes.length });
    }
  } catch (error) {
    console.error('LikeComment error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};

// 내 댓글 목록
exports.getMyComments = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const comments = await Comment.find({ 
      author: req.user._id,
      isDeleted: false 
    })
      .populate('post', 'title')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Comment.countDocuments({ 
      author: req.user._id,
      isDeleted: false 
    });

    res.json({
      comments,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('GetMyComments error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};
