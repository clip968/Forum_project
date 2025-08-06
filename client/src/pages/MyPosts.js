import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { postsAPI } from '../services/api';

function MyPosts() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchMyPosts();
  }, [currentPage]);

  const fetchMyPosts = async () => {
    try {
      setLoading(true);
      const response = await postsAPI.getMyPosts({
        page: currentPage,
        limit: 10
      });
      setPosts(response.data.posts);
      setPagination(response.data.pagination);
    } catch (error) {
      setError('내 게시글을 불러오는데 실패했습니다.');
      console.error('Error fetching my posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId, postTitle) => {
    if (!window.confirm(`"${postTitle}" 게시글을 정말로 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await postsAPI.deletePost(postId);
      alert('게시글이 삭제되었습니다.');
      fetchMyPosts(); // 목록 새로고침
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('게시글 삭제에 실패했습니다.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const getCategoryLabel = (category) => {
    const categoryLabels = {
      general: '일반',
      tech: '기술',
      discussion: '토론',
      question: '질문',
      announcement: '공지사항'
    };
    return categoryLabels[category] || category;
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    if (!pagination.pages || pagination.pages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(pagination.pages, startPage + maxVisiblePages - 1);

    // 이전 페이지 버튼
    if (currentPage > 1) {
      pages.push(
        <button
          key="prev"
          onClick={() => handlePageChange(currentPage - 1)}
          className="pagination-btn"
        >
          이전
        </button>
      );
    }

    // 페이지 번호 버튼들
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`pagination-btn ${i === currentPage ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    // 다음 페이지 버튼
    if (currentPage < pagination.pages) {
      pages.push(
        <button
          key="next"
          onClick={() => handlePageChange(currentPage + 1)}
          className="pagination-btn"
        >
          다음
        </button>
      );
    }

    return <div className="pagination">{pages}</div>;
  };

  if (loading && currentPage === 1) {
    return <div className="loading">로딩 중...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="my-posts">
      <div className="page-header">
        <h2>내 게시글</h2>
        <Link to="/create-post" className="btn-primary">
          새 게시글 작성
        </Link>
      </div>

      {pagination.total > 0 && (
        <div className="posts-stats">
          총 {pagination.total}개의 게시글 
          ({pagination.page}/{pagination.pages} 페이지)
        </div>
      )}

      {posts.length === 0 ? (
        <div className="no-posts">
          <p>작성한 게시글이 없습니다.</p>
          <Link to="/create-post" className="btn-primary">
            첫 번째 게시글 작성하기
          </Link>
        </div>
      ) : (
        <>
          <div className="posts-list">
            {posts.map((post) => (
              <div key={post._id} className="post-card">
                <div className="post-main">
                  <div className="post-header">
                    <h3>
                      <Link to={`/posts/${post._id}`} className="post-title">
                        {post.title}
                        {post.isPinned && <span className="pin-badge">📌</span>}
                        {post.isLocked && <span className="lock-badge">🔒</span>}
                      </Link>
                    </h3>
                    <div className="post-meta">
                      <span className="category">{getCategoryLabel(post.category)}</span>
                      <span className="date">{formatDate(post.createdAt)}</span>
                    </div>
                  </div>

                  <div className="post-content-preview">
                    {post.content.substring(0, 150)}
                    {post.content.length > 150 && '...'}
                  </div>

                  {post.tags && post.tags.length > 0 && (
                    <div className="post-tags">
                      {post.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="tag">#{tag}</span>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="tag-more">+{post.tags.length - 3}</span>
                      )}
                    </div>
                  )}

                  <div className="post-stats">
                    <span>👁️ {post.views}</span>
                    <span>👍 {post.likes?.length || 0}</span>
                    <span>💬 {post.comments?.length || 0}</span>
                  </div>
                </div>

                <div className="post-actions">
                  <Link 
                    to={`/posts/${post._id}`} 
                    className="btn-secondary small"
                  >
                    보기
                  </Link>
                  <button
                    onClick={() => handleDeletePost(post._id, post.title)}
                    className="btn-danger small"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>

          {renderPagination()}
        </>
      )}

      {loading && currentPage > 1 && (
        <div className="loading-overlay">페이지 로딩 중...</div>
      )}
    </div>
  );
}

export default MyPosts;