const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['general', 'tech', 'discussion', 'question', 'announcement'],
    default: 'general'
  },
  tags: [{
    type: String,
    trim: true
  }],
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isPublished: {
    type: Boolean,
    default: true
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  editHistory: [{
    editedAt: {
      type: Date,
      default: Date.now
    },
    editedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    previousContent: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 텍스트 검색을 위한 인덱스
postSchema.index({ title: 'text', content: 'text', tags: 'text' });

// 정렬 및 필터링을 위한 복합 인덱스
postSchema.index({ category: 1, createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ isPinned: -1, createdAt: -1 });

// 가상 필드: 좋아요 수
postSchema.virtual('likesCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// 가상 필드: 댓글 (populate 시 사용)
postSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'post'
});

// JSON 변환 시 가상 필드 포함
postSchema.set('toJSON', { virtuals: true });

// 업데이트 시간 자동 갱신
postSchema.pre('findOneAndUpdate', function() {
  this.set({ updatedAt: new Date() });
});

module.exports = mongoose.model('Post', postSchema);
