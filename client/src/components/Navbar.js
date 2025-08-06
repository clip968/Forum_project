import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          📝 Forum
        </Link>
        <div className="navbar-menu">
          <Link to="/posts">게시글</Link>
          {user ? (
            <>
              <Link to="/create-post">글쓰기</Link>
              <Link to="/my-posts">내 게시글</Link>
              <span style={{ padding: '0.5rem 1rem' }}>
                안녕하세요, {user.username}님!
              </span>
              <button onClick={handleLogout}>로그아웃</button>
            </>
          ) : (
            <>
              <Link to="/login">로그인</Link>
              <Link to="/register">회원가입</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
