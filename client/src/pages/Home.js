import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Home() {
  const { user } = useAuth();

  return (
    <div style={{ textAlign: 'center', marginTop: '3rem' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
        📝 포럼에 오신 것을 환영합니다!
      </h1>
      <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '2rem' }}>
        자유롭게 글을 작성하고, 의견을 나누어보세요.
      </p>
      
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link to="/posts" className="btn btn-primary">
          게시글 둘러보기
        </Link>
        {user ? (
          <Link to="/create-post" className="btn btn-secondary">
            새 글 작성하기
          </Link>
        ) : (
          <Link to="/register" className="btn btn-secondary">
            지금 시작하기
          </Link>
        )}
      </div>

      <div style={{ marginTop: '4rem' }}>
        <h2>주요 기능</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
          marginTop: '2rem',
          maxWidth: '800px',
          margin: '2rem auto'
        }}>
          <div className="post-card">
            <h3>✍️ 글쓰기</h3>
            <p>다양한 주제의 글을 작성하고 공유하세요</p>
          </div>
          <div className="post-card">
            <h3>💬 댓글</h3>
            <p>댓글과 대댓글로 소통하세요</p>
          </div>
          <div className="post-card">
            <h3>❤️ 좋아요</h3>
            <p>마음에 드는 글과 댓글에 좋아요를 눌러보세요</p>
          </div>
          <div className="post-card">
            <h3>🔍 검색</h3>
            <p>원하는 내용을 쉽게 찾아보세요</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
