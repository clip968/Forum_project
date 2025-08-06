import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postsAPI } from '../services/api';

function CreatePost() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const categories = [
    { value: 'general', label: '일반' },
    { value: 'tech', label: '기술' },
    { value: 'discussion', label: '토론' },
    { value: 'question', label: '질문' },
    { value: 'announcement', label: '공지사항' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // 입력 시 해당 필드 에러 제거
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = '제목을 입력해주세요.';
    } else if (formData.title.length > 200) {
      newErrors.title = '제목은 200자를 초과할 수 없습니다.';
    }

    if (!formData.content.trim()) {
      newErrors.content = '내용을 입력해주세요.';
    } else if (formData.content.length < 10) {
      newErrors.content = '내용은 최소 10자 이상이어야 합니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const postData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        tags: formData.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0)
      };

      const response = await postsAPI.createPost(postData);
      alert('게시글이 작성되었습니다.');
      navigate(`/posts/${response.data.post._id}`);
    } catch (error) {
      console.error('Error creating post:', error);
      
      if (error.response?.data?.errors) {
        // 서버 검증 에러
        const serverErrors = {};
        error.response.data.errors.forEach(err => {
          serverErrors[err.param] = err.msg;
        });
        setErrors(serverErrors);
      } else {
        alert('게시글 작성에 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post">
      <h2>게시글 작성</h2>
      
      <form onSubmit={handleSubmit} className="post-form">
        <div className="form-group">
          <label htmlFor="title">제목 *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="게시글 제목을 입력하세요"
            disabled={loading}
            className={errors.title ? 'error' : ''}
          />
          {errors.title && <span className="error-message">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="category">카테고리</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            disabled={loading}
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="tags">태그</label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="태그를 쉼표로 구분하여 입력하세요 (예: javascript, react, nodejs)"
            disabled={loading}
          />
          <small className="form-help">
            태그는 쉼표(,)로 구분하여 입력하세요. 각 태그는 20자 이하로 작성해주세요.
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="content">내용 *</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="게시글 내용을 입력하세요 (최소 10자 이상)"
            rows="15"
            disabled={loading}
            className={errors.content ? 'error' : ''}
          />
          {errors.content && <span className="error-message">{errors.content}</span>}
          <div className="character-count">
            {formData.content.length}자
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={loading}
            className="btn-secondary"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={loading || !formData.title.trim() || !formData.content.trim()}
            className="btn-primary"
          >
            {loading ? '작성 중...' : '게시글 작성'}
          </button>
        </div>
      </form>

      <div className="form-tips">
        <h4>💡 게시글 작성 팁</h4>
        <ul>
          <li>제목은 간결하고 명확하게 작성해주세요.</li>
          <li>내용은 최소 10자 이상 작성해야 합니다.</li>
          <li>적절한 카테고리를 선택하여 다른 사용자들이 쉽게 찾을 수 있도록 해주세요.</li>
          <li>태그를 활용하면 관련 게시글을 더 쉽게 찾을 수 있습니다.</li>
        </ul>
      </div>
    </div>
  );
}

export default CreatePost;