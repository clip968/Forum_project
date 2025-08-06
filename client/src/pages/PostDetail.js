import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { postsAPI, commentsAPI } from '../services/api';

function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await postsAPI.getPost(id);
      setPost(response.data);
    } catch (error) {
      setError('게시글을 불러오는데 실패했습니다.');
      console.error('Error fetching post:', error);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await commentsAPI.getComments(id);
      setComments(response.data.comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLikePost = async () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      await postsAPI.likePost(id);
      fetchPost(); // 좋아요 수 업데이트
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (!newComment.trim()) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }

    setSubmittingComment(true);
    try {
      await commentsAPI.createComment(id, { content: newComment });
      setNewComment('');
      fetchComments(); // 댓글 목록 새로고침
    } catch (error) {
      console.error('Error creating comment:', error);
      alert('댓글 작성에 실패했습니다.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      await commentsAPI.likeComment(commentId);
      fetchComments(); // 댓글 목록 새로고침
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await postsAPI.deletePost(id);
      alert('게시글이 삭제되었습니다.');
      navigate('/posts');
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('게시글 삭제에 실패했습니다.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  if (loading) return <div className="loading">로딩 중...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!post) return <div className="error">게시글을 찾을 수 없습니다.</div>;

  return (
    <div className="post-detail">
      <div className="post-header">
        <h1>{post.title}</h1>
        <div className="post-meta">
          <span>작성자: {post.author?.username}</span>
          <span>작성일: {formatDate(post.createdAt)}</span>
          <span>조회수: {post.views}</span>
          <span>카테고리: {post.category}</span>
        </div>
        {post.tags && post.tags.length > 0 && (
          <div className="post-tags">
            {post.tags.map((tag, index) => (
              <span key={index} className="tag">#{tag}</span>
            ))}
          </div>
        )}
        {user && (user._id === post.author?._id || user.role === 'admin') && (
          <div className="post-actions">
            <button onClick={handleDeletePost} className="btn-danger">
              삭제
            </button>
          </div>
        )}
      </div>

      <div className="post-content">
        <div className="content">
          {post.content.split('\n').map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
      </div>

      <div className="post-footer">
        <button 
          onClick={handleLikePost} 
          className={`like-btn ${post.likes?.includes(user?._id) ? 'liked' : ''}`}
        >
          👍 좋아요 ({post.likes?.length || 0})
        </button>
      </div>

      <div className="comments-section">
        <h3>댓글 ({comments.length})</h3>
        
        {user && (
          <form onSubmit={handleSubmitComment} className="comment-form">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 입력하세요..."
              rows="3"
              disabled={submittingComment}
            />
            <button 
              type="submit" 
              disabled={submittingComment || !newComment.trim()}
            >
              {submittingComment ? '작성 중...' : '댓글 작성'}
            </button>
          </form>
        )}

        <div className="comments-list">
          {comments.map((comment) => (
            <div key={comment._id} className="comment">
              <div className="comment-header">
                <strong>{comment.author?.username}</strong>
                <span className="comment-date">
                  {formatDate(comment.createdAt)}
                </span>
              </div>
              <div className="comment-content">{comment.content}</div>
              <div className="comment-footer">
                <button 
                  onClick={() => handleLikeComment(comment._id)}
                  className={`like-btn small ${comment.likes?.includes(user?._id) ? 'liked' : ''}`}
                >
                  👍 {comment.likes?.length || 0}
                </button>
              </div>
              
              {comment.replies && comment.replies.length > 0 && (
                <div className="replies">
                  {comment.replies.map((reply) => (
                    <div key={reply._id} className="reply">
                      <div className="comment-header">
                        <strong>{reply.author?.username}</strong>
                        <span className="comment-date">
                          {formatDate(reply.createdAt)}
                        </span>
                      </div>
                      <div className="comment-content">{reply.content}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PostDetail;