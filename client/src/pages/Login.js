import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState([]);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
  setErrors([]);
    
    const result = await login(email, password);
    if (result.success) {
      navigate('/posts');
    } else {
      if (result.error) {
        setErrors(result.error.split('\n'));
      } else {
        setErrors(['로그인에 실패했습니다.']);
      }
    }
  };

  return (
    <div className="form-container">
      <h2>로그인</h2>
      {errors.length > 0 && (
        <div className="error" style={{ whiteSpace: 'pre-line' }}>
          <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>이메일</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="email@example.com"
          />
        </div>
        <div className="form-group">
          <label>비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="비밀번호를 입력하세요"
          />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
          로그인
        </button>
      </form>
      <p style={{ marginTop: '1rem', textAlign: 'center' }}>
        계정이 없으신가요? <Link to="/register">회원가입</Link>
      </p>
    </div>
  );
}

export default Login;
