import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postsAPI } from '../services/api';

function PostList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    fetchPosts();
  }, [page, category, search]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        ...(category && { category }),
        ...(search && { search })
      };
      const response = await postsAPI.getPosts(params);
      setPosts(response.data.posts);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      setError('게시글을 불러오는데 실패했습니다.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const getCategoryClass = (cat) => `category-badge category-${cat}`;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) return <div className="loading">게시글을 불러오는 중...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <h1>게시글 목록</h1>
      
      {/* 검색 및 필터 */}
      <div style={{ marginBottom: '2rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="검색어를 입력하세요..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
          />
          <button type="submit" className="btn btn-primary">검색</button>
        </form>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className={`btn ${category === '' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setCategory(''); setPage(1); }}
          >
            전체
          </button>
          <button 
            className={`btn ${category === 'general' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setCategory('general'); setPage(1); }}
          >
            일반
          </button>
          <button 
            className={`btn ${category === 'tech' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setCategory('tech'); setPage(1); }}
          >
            기술
          </button>
          <button 
            className={`btn ${category === 'discussion' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setCategory('discussion'); setPage(1); }}
          >
            토론
          </button>
          <button 
            className={`btn ${category === 'question' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setCategory('question'); setPage(1); }}
          >
            질문
          </button>
        </div>
      </div>

      {/* 게시글 목록 */}
      {posts.length === 0 ? (
        <div className="post-card">
          <p>게시글이 없습니다.</p>
        </div>
      ) : (
        posts.map(post => (
          <div key={post._id} className="post-card">
            <Link to={`/posts/${post._id}`}>
              <h3>
                {post.isPinned && '📌 '}
                {post.isLocked && '🔒 '}
                {post.title}
              </h3>
            </Link>
            <div className="post-meta">
              <span className={getCategoryClass(post.category)}>{post.category}</span>
              작성자: {post.author?.username || '알 수 없음'} | 
              {formatDate(post.createdAt)} | 
              조회 {post.views} | 
              좋아요 {post.likesCount || 0}
            </div>
            <div className="post-content">
              {post.content.substring(0, 200)}
              {post.content.length > 200 && '...'}
            </div>
            {post.tags && post.tags.length > 0 && (
              <div className="tags">
                {post.tags.map((tag, index) => (
                  <span key={index} className="tag">#{tag}</span>
                ))}
              </div>
            )}
          </div>
        ))
      )}

      {/* 페이지네이션 */}
      <div className="pagination">
        <button 
          onClick={() => setPage(page - 1)} 
          disabled={page === 1}
        >
          이전
        </button>
        <span style={{ padding: '0 1rem' }}>
          {page} / {totalPages}
        </span>
        <button 
          onClick={() => setPage(page + 1)} 
          disabled={page === totalPages}
        >
          다음
        </button>
      </div>
    </div>
  );
}

export default PostList;
