# User Authentication & Profile Features - Lladlad

## ✅ Implemented Features

### 1. Current User Endpoint
**Endpoint**: `GET /api/users/me`
- Returns the currently logged-in user's details
- Requires authentication (JWT token)
- Returns full user profile with all fields

**Usage**:
```bash
GET http://localhost:8080/api/users/me
Authorization: Bearer <your-jwt-token>
```

**Response**:
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@lladlad.com",
  "firstName": "Admin",
  "lastName": "User",
  "bio": null,
  "profileImage": null,
  "role": "ADMIN",
  "createdAt": "2024-01-15T10:30:00",
  "postCount": 5
}
```

---

### 2. User Profile Endpoint
**Endpoint**: `GET /api/users/profile`
- Same as `/api/users/me` (alias for consistency)
- Returns current user's profile information
- Requires authentication

**Usage**:
```bash
GET http://localhost:8080/api/users/profile
Authorization: Bearer <your-jwt-token>
```

---

### 3. Email Validation Endpoint
**Endpoint**: `GET /api/users/check-email?email=user@example.com`
- Checks if an email already exists in the database
- Public endpoint (no authentication required)
- Useful for registration forms

**Usage**:
```bash
GET http://localhost:8080/api/users/check-email?email=test@example.com
```

**Response**:
```json
{
  "email": "test@example.com",
  "exists": true
}
```

**Use Cases**:
- Frontend validation before registration
- Google OAuth - check if user exists before creating account
- Email uniqueness checking

---

### 4. Admin-Only User List
**Endpoint**: `GET /api/users`
- **Now restricted to ADMIN role only**
- Returns list of all users
- Requires ADMIN authentication

**Usage**:
```bash
GET http://localhost:8080/api/users
Authorization: Bearer <admin-jwt-token>
```

**Response**:
```json
[
  {
    "id": 1,
    "username": "admin",
    "email": "admin@lladlad.com",
    "role": "ADMIN",
    ...
  },
  {
    "id": 2,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "USER",
    ...
  }
]
```

**Error (Non-Admin)**:
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 403,
  "error": "Forbidden",
  "message": "Access Denied"
}
```

---

### 5. Google OAuth2 Authentication

#### Option A: Custom Google OAuth (Implemented)
**Endpoint**: `POST /api/oauth2/google/callback`

This endpoint accepts Google user information from the frontend and:
1. Checks if user exists by email
2. Creates new user if doesn't exist
3. Updates profile image if available
4. Returns JWT token for authentication

**Request Body**:
```json
{
  "email": "user@gmail.com",
  "name": "John Doe",
  "picture": "https://lh3.googleusercontent.com/...",
  "sub": "google-user-id-12345"
}
```

**Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "id": 1,
  "username": "user_1234567890",
  "email": "user@gmail.com"
}
```

**Frontend Integration**:
```javascript
// After Google Sign-In
const googleUser = await googleAuth.signIn();
const response = await fetch('http://localhost:8080/api/oauth2/google/callback', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: googleUser.email,
    name: googleUser.name,
    picture: googleUser.picture,
    sub: googleUser.sub
  })
});
const { token } = await response.json();
// Store token and use for authenticated requests
```

#### Option B: Full OAuth2 Flow (Optional)
To enable full OAuth2 flow, uncomment and configure in `application.properties`:
```properties
spring.security.oauth2.client.registration.google.client-id=your-client-id
spring.security.oauth2.client.registration.google.client-secret=your-client-secret
spring.security.oauth2.client.registration.google.scope=profile,email
```

---

## 🔐 Security Configuration

### Public Endpoints (No Auth Required)
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `POST /api/oauth2/google/callback` - Google OAuth
- `GET /api/users/check-email` - Email validation
- `GET /api/users/{id}` - Get user by ID (public profile)

### Authenticated Endpoints (Any Logged-in User)
- `GET /api/users/me` - Current user
- `GET /api/users/profile` - User profile

### Admin-Only Endpoints
- `GET /api/users` - List all users
- `POST /api/users` - Create user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

---

## 📝 Complete Authentication Flow

### Standard Login Flow:
```
1. User → POST /api/auth/login (username + password)
2. Backend → Validates credentials
3. Backend → Returns JWT token
4. Frontend → Stores token
5. Frontend → Uses token in Authorization header for all requests
6. Backend → JwtAuthenticationFilter validates token
7. Backend → Sets user in SecurityContext
8. Controller → Can access current user via SecurityContext
```

### Google OAuth Flow:
```
1. User → Clicks "Sign in with Google" on frontend
2. Frontend → Google OAuth popup
3. User → Authorizes with Google
4. Frontend → Receives Google user info
5. Frontend → POST /api/oauth2/google/callback (with Google user data)
6. Backend → Checks if email exists in DB
7. Backend → Creates user if new, or updates if exists
8. Backend → Returns JWT token
9. Frontend → Stores token and uses for authenticated requests
```

### Getting Current User:
```
1. Frontend → GET /api/users/me (with JWT token)
2. Backend → JwtAuthenticationFilter extracts username from token
3. Backend → Loads user from database
4. Backend → Returns user details
5. Frontend → Displays user info in UI
```

---

## 🧪 Testing Examples

### 1. Login and Get Current User
```bash
# Step 1: Login
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}

# Response: { "token": "eyJhbGc..." }

# Step 2: Get Current User
GET http://localhost:8080/api/users/me
Authorization: Bearer eyJhbGc...
```

### 2. Check Email Exists
```bash
GET http://localhost:8080/api/users/check-email?email=admin@lladlad.com

# Response: { "email": "admin@lladlad.com", "exists": true }
```

### 3. Google OAuth (Frontend Example)
```javascript
// Install: npm install @react-oauth/google

import { GoogleLogin } from '@react-oauth/google';

function Login() {
  const handleGoogleSuccess = async (credentialResponse) => {
    // Decode JWT to get user info (or use Google API)
    const googleUser = decodeJWT(credentialResponse.credential);
    
    // Send to backend
    const response = await fetch('http://localhost:8080/api/oauth2/google/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
        sub: googleUser.sub
      })
    });
    
    const data = await response.json();
    localStorage.setItem('token', data.token);
    // User is now logged in!
  };

  return (
    <GoogleLogin
      onSuccess={handleGoogleSuccess}
      onError={() => console.log('Login Failed')}
    />
  );
}
```

### 4. Admin Access User List
```bash
# Login as admin first
POST http://localhost:8080/api/auth/login
{
  "username": "admin",
  "password": "admin123"
}

# Get all users (admin only)
GET http://localhost:8080/api/users
Authorization: Bearer <admin-token>
```

---

## 🎯 Frontend Integration Guide

### 1. Store Token After Login
```javascript
// After successful login
localStorage.setItem('token', response.data.token);
localStorage.setItem('user', JSON.stringify(response.data));
```

### 2. Get Current User on App Load
```javascript
useEffect(() => {
  const token = localStorage.getItem('token');
  if (token) {
    fetch('http://localhost:8080/api/users/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(user => setCurrentUser(user))
    .catch(() => {
      // Token invalid, logout
      localStorage.removeItem('token');
    });
  }
}, []);
```

### 3. Check Email Before Registration
```javascript
const checkEmail = async (email) => {
  const response = await fetch(
    `http://localhost:8080/api/users/check-email?email=${email}`
  );
  const data = await response.json();
  if (data.exists) {
    setError('Email already registered');
  }
};
```

### 4. Show User Profile
```javascript
const [user, setUser] = useState(null);

useEffect(() => {
  const token = localStorage.getItem('token');
  fetch('http://localhost:8080/api/users/profile', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  .then(res => res.json())
  .then(data => setUser(data));
}, []);

return (
  <div>
    <h1>Welcome, {user?.firstName} {user?.lastName}</h1>
    <p>Email: {user?.email}</p>
    {user?.profileImage && (
      <img src={user.profileImage} alt="Profile" />
    )}
  </div>
);
```

---

## 📋 Summary

✅ **Current User Endpoint** - Know who is logged in
✅ **User Profile Endpoint** - Get full user details
✅ **Email Validation** - Check if email exists
✅ **Admin-Only User List** - Only admins can view all users
✅ **Google OAuth2** - Custom implementation for Google sign-in
✅ **Security Configured** - Proper role-based access control

All features are ready to use! The backend now supports complete user authentication and profile management.



























