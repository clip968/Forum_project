import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState([]);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  setErrors([]);

    // 비밀번호 확인
    const tempErrors = [];
    if (formData.password !== formData.confirmPassword) {
      tempErrors.push('비밀번호가 일치하지 않습니다.');
    }
    // 비밀번호 정책: 6자 이상, 대문자/소문자/숫자 포함
    if (formData.password.length < 6) {
      tempErrors.push('비밀번호는 최소 6자 이상이어야 합니다.');
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(formData.password)) {
      tempErrors.push('비밀번호는 대문자, 소문자, 숫자를 모두 포함해야 합니다.');
    }
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      tempErrors.push('사용자명은 영문, 숫자, 언더스코어만 사용 가능합니다.');
    }
    if (formData.username.length < 2 || formData.username.length > 30) {
      tempErrors.push('사용자명은 2-30자 사이여야 합니다.');
    }
    if (tempErrors.length) {
      setErrors(tempErrors);
      return;
    }

    const result = await register(formData.username, formData.email, formData.password);
    if (result.success) {
      navigate('/posts');
    } else {
      // 서버에서 \n 로 조합된 메시지 혹은 단일 문자열
      if (result.error) {
        setErrors(result.error.split('\n'));
      } else {
        setErrors(['회원가입에 실패했습니다.']);
      }
    }
  };

  return (
    <div className="form-container">
      <h2>회원가입</h2>
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
          <label>사용자명</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            placeholder="사용자명 (3-30자)"
            minLength="3"
            maxLength="30"
          />
        </div>
        <div className="form-group">
          <label>이메일</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="email@example.com"
          />
        </div>
        <div className="form-group">
          <label>비밀번호</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="비밀번호 (최소 6자)"
            minLength="6"
          />
        </div>
        <div className="form-group">
          <label>비밀번호 확인</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            placeholder="비밀번호를 다시 입력하세요"
          />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
          회원가입
        </button>
      </form>
      <p style={{ marginTop: '1rem', textAlign: 'center' }}>
        이미 계정이 있으신가요? <Link to="/login">로그인</Link>
      </p>
    </div>
  );
}

export default Register;
