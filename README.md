# Forum API

간단한 포럼(게시판) REST API 서버입니다.

## 기능

- 사용자 인증 (회원가입, 로그인, JWT 토큰)
- 게시글 CRUD (작성, 읽기, 수정, 삭제)
- 댓글 및 대댓글 기능
- 좋아요 기능
- 페이지네이션 및 검색
- 권한 관리 (일반 사용자, 모더레이터, 관리자)

## 시작하기

### 필수 요구사항

- Node.js (v14 이상)
- MongoDB (로컬 또는 MongoDB Atlas)

### 설치 및 실행

1. 의존성 설치
```bash
npm install
```

2. 환경 변수 설정
`.env` 파일을 수정하여 MongoDB 연결 정보를 설정하세요.

3. 개발 서버 실행
```bash
npm run dev
```

4. 프로덕션 서버 실행
```bash
npm start
```

## API 엔드포인트

### 인증 (Authentication)

#### 회원가입
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "Test123!"
}
```

#### 로그인
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test123!"
}
```

#### 현재 사용자 정보
```
GET /api/auth/me
Authorization: Bearer {token}
```

#### 비밀번호 변경
```
POST /api/auth/change-password
Authorization: Bearer {token}
Content-Type: application/json

{
  "currentPassword": "Test123!",
  "newPassword": "NewPass123!"
}
```

#### 프로필 업데이트
```
PUT /api/auth/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "username": "newusername",
  "email": "newemail@example.com"
}
```

### 게시글 (Posts)

#### 게시글 목록 조회
```
GET /api/posts?page=1&limit=10&category=tech&search=keyword&sortBy=createdAt&order=desc
```

#### 게시글 상세 조회
```
GET /api/posts/{postId}
```

#### 게시글 작성
```
POST /api/posts
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "게시글 제목",
  "content": "게시글 내용입니다. 최소 10자 이상 작성해주세요.",
  "category": "tech",
  "tags": ["javascript", "nodejs"]
}
```

#### 게시글 수정
```
PUT /api/posts/{postId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "수정된 제목",
  "content": "수정된 내용입니다.",
  "category": "discussion",
  "tags": ["updated", "edited"]
}
```

#### 게시글 삭제
```
DELETE /api/posts/{postId}
Authorization: Bearer {token}
```

#### 게시글 좋아요
```
POST /api/posts/{postId}/like
Authorization: Bearer {token}
```

#### 게시글 고정 (관리자/모더레이터)
```
POST /api/posts/{postId}/pin
Authorization: Bearer {token}
```

#### 게시글 잠금 (관리자/모더레이터)
```
POST /api/posts/{postId}/lock
Authorization: Bearer {token}
```

#### 내 게시글 목록
```
GET /api/posts/my-posts?page=1&limit=10
Authorization: Bearer {token}
```

### 댓글 (Comments)

#### 댓글 목록 조회
```
GET /api/comments/post/{postId}?page=1&limit=20
```

#### 댓글 작성
```
POST /api/comments/post/{postId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "댓글 내용입니다.",
  "parentComment": null  // 대댓글의 경우 부모 댓글 ID
}
```

#### 댓글 수정
```
PUT /api/comments/{commentId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "수정된 댓글 내용입니다."
}
```

#### 댓글 삭제
```
DELETE /api/comments/{commentId}
Authorization: Bearer {token}
```

#### 댓글 좋아요
```
POST /api/comments/{commentId}/like
Authorization: Bearer {token}
```

#### 내 댓글 목록
```
GET /api/comments/my-comments?page=1&limit=20
Authorization: Bearer {token}
```

## 카테고리

- `general` - 일반
- `tech` - 기술
- `discussion` - 토론
- `question` - 질문
- `announcement` - 공지사항

## 사용자 역할

- `user` - 일반 사용자 (기본값)
- `moderator` - 모더레이터
- `admin` - 관리자

## 에러 응답

모든 에러는 다음과 같은 형식으로 반환됩니다:

```json
{
  "error": "에러 메시지"
}
```

유효성 검사 실패 시:

```json
{
  "errors": [
    {
      "msg": "에러 메시지",
      "param": "필드명",
      "location": "body"
    }
  ]
}
```

## 페이지네이션 응답

페이지네이션이 적용된 엔드포인트는 다음과 같은 형식으로 응답합니다:

```json
{
  "posts": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "pages": 10,
    "limit": 10
  }
}
```

## 보안

- 비밀번호는 bcrypt로 해시화되어 저장됩니다.
- JWT 토큰을 사용하여 인증합니다.
- 토큰은 7일 후 만료됩니다.
- CORS가 활성화되어 있습니다.

## 데이터베이스 스키마

### User
- username (고유)
- email (고유)
- password (해시화)
- role
- isActive
- createdAt
- updatedAt

### Post
- title
- content
- author (User 참조)
- category
- tags
- views
- likes (User 배열)
- isPublished
- isPinned
- isLocked
- editHistory
- createdAt
- updatedAt

### Comment
- content
- author (User 참조)
- post (Post 참조)
- parentComment (Comment 참조, 대댓글)
- likes (User 배열)
- isEdited
- editHistory
- isDeleted
- createdAt
- updatedAt
