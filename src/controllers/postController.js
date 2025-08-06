const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { validationResult } = require('express-validator');

// 게시글 목록 조회 (페이지네이션, 검색, 필터링)
exports.getPosts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      search,
      sortBy = 'createdAt',
      order = 'desc',
      author
    } = req.query;

    const query = { isPublished: true };
    
    // 카테고리 필터
    if (category) {
      query.category = category;
    }

    // 작성자 필터
    if (author) {
      query.author = author;
    }

    // 검색 (제목, 내용, 태그)
    if (search) {
      query.$text = { $search: search };
    }

    const sortOptions = {};
    sortOptions[sortBy] = order === 'asc' ? 1 : -1;
    
    // 고정 게시글을 먼저 보여주기
    if (sortBy === 'createdAt') {
      sortOptions.isPinned = -1;
    }

    const posts = await Post.find(query)
      .populate('author', 'username')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-editHistory');

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('GetPosts error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};

// 게시글 상세 조회
exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username email')
      .populate({
        path: 'comments',
        match: { parentComment: null, isDeleted: false },
        populate: [
          { path: 'author', select: 'username' },
          {
            path: 'replies',
            match: { isDeleted: false },
            populate: { path: 'author', select: 'username' }
          }
        ]
      });

    if (!post) {
      return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
    }

    // 조회수 증가
    post.views += 1;
    await post.save();

    res.json(post);
  } catch (error) {
    console.error('GetPost error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};

// 게시글 작성
exports.createPost = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, category, tags } = req.body;

    const post = new Post({
      title,
      content,
      category,
      tags,
      author: req.user._id
    });

    await post.save();
    await post.populate('author', 'username');

    res.status(201).json({
      message: '게시글이 작성되었습니다.',
      post
    });
  } catch (error) {
    console.error('CreatePost error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};

// 게시글 수정
exports.updatePost = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, category, tags } = req.body;
    const post = req.resource; // checkOwnership 미들웨어에서 설정

    // 수정 이력 저장
    if (content && content !== post.content) {
      post.editHistory.push({
        editedBy: req.user._id,
        previousContent: post.content
      });
    }

    // 업데이트
    if (title) post.title = title;
    if (content) post.content = content;
    if (category) post.category = category;
    if (tags) post.tags = tags;

    await post.save();
    await post.populate('author', 'username');

    res.json({
      message: '게시글이 수정되었습니다.',
      post
    });
  } catch (error) {
    console.error('UpdatePost error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};

// 게시글 삭제
exports.deletePost = async (req, res) => {
  try {
    const post = req.resource;

    // 관련 댓글들도 삭제
    await Comment.deleteMany({ post: post._id });
    
    await post.deleteOne();

    res.json({ message: '게시글이 삭제되었습니다.' });
  } catch (error) {
    console.error('DeletePost error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};

// 게시글 좋아요
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
    }

    const userIndex = post.likes.indexOf(req.user._id);
    
    if (userIndex > -1) {
      // 이미 좋아요한 경우 - 취소
      post.likes.splice(userIndex, 1);
      await post.save();
      res.json({ message: '좋아요가 취소되었습니다.', likesCount: post.likes.length });
    } else {
      // 좋아요 추가
      post.likes.push(req.user._id);
      await post.save();
      res.json({ message: '좋아요를 눌렀습니다.', likesCount: post.likes.length });
    }
  } catch (error) {
    console.error('LikePost error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};

// 게시글 고정 (관리자/모더레이터)
exports.pinPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
    }

    post.isPinned = !post.isPinned;
    await post.save();

    res.json({ 
      message: post.isPinned ? '게시글이 고정되었습니다.' : '게시글 고정이 해제되었습니다.',
      isPinned: post.isPinned
    });
  } catch (error) {
    console.error('PinPost error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};

// 게시글 잠금 (관리자/모더레이터)
exports.lockPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
    }

    post.isLocked = !post.isLocked;
    await post.save();

    res.json({ 
      message: post.isLocked ? '게시글이 잠겼습니다.' : '게시글 잠금이 해제되었습니다.',
      isLocked: post.isLocked
    });
  } catch (error) {
    console.error('LockPost error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};

// 내 게시글 목록
exports.getMyPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const posts = await Post.find({ author: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-editHistory');

    const total = await Post.countDocuments({ author: req.user._id });

    res.json({
      posts,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('GetMyPosts error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};
