# Admin Access Control - Lladlad Blog Application

## Overview
The Lladlad blog application now implements role-based access control (RBAC) where only users with the **ADMIN** role can perform certain administrative operations.

## Changes Made

### 1. App Name Updated
- Application name changed to **"Lladlad"** throughout the codebase
- Updated in:
  - `pom.xml`
  - `frontend/public/index.html`
  - `frontend/src/App.js`
  - `README.md`

### 2. Admin-Only Operations

#### User Management (Admin Only)
- ✅ **Create User** (`POST /api/users`) - Admin only
- ✅ **Update User** (`PUT /api/users/{id}`) - Admin only
- ✅ **Delete User** (`DELETE /api/users/{id}`) - Admin only
- ✅ **Get Users** (`GET /api/users`) - Public (anyone can view)
- ✅ **Get User by ID** (`GET /api/users/{id}`) - Public (anyone can view)

#### Category Management (Admin Only)
- ✅ **Create Category** (`POST /api/categories`) - Admin only
- ✅ **Delete Category** (`DELETE /api/categories/{id}`) - Admin only
- ✅ **Get Categories** (`GET /api/categories`) - Public (anyone can view)
- ✅ **Get Category by ID** (`GET /api/categories/{id}`) - Public (anyone can view)
- ✅ **Update Category** (`PUT /api/categories/{id}`) - Public (can be changed to admin only if needed)

### 3. Security Implementation

#### Method-Level Security
Added `@PreAuthorize("hasRole('ADMIN')")` annotations to restricted endpoints:

**UserController.java**:
```java
@PostMapping
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<?> createUser(...)

@PutMapping("/{id}")
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<?> updateUser(...)

@DeleteMapping("/{id}")
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<?> deleteUser(...)
```

**CategoryController.java**:
```java
@PostMapping
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<?> createCategory(...)

@DeleteMapping("/{id}")
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<?> deleteCategory(...)
```

#### Security Configuration
Updated `SecurityConfig.java` to enforce role-based access:
- GET endpoints remain public
- POST, PUT, DELETE endpoints require ADMIN role

### 4. Default Admin User
Created a default admin user in `DataInitializer.java`:
- **Username**: `admin`
- **Password**: `admin123`
- **Email**: `admin@lladlad.com`
- **Role**: `ADMIN`

**⚠️ Important**: Change the admin password in production!

## How It Works

### Authentication Flow
1. User logs in via `POST /api/auth/login`
2. System validates credentials
3. JWT token is generated with user's roles
4. Token is returned to client

### Authorization Flow
1. Client sends request with JWT token in `Authorization: Bearer <token>` header
2. `JwtAuthenticationFilter` validates token
3. User's roles are loaded from token
4. `@PreAuthorize` annotation checks if user has required role
5. If authorized → Request proceeds
6. If not authorized → 403 Forbidden error

## Testing Admin Access

### 1. Login as Admin
```bash
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}

# Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "id": 1,
  "username": "admin",
  "email": "admin@lladlad.com"
}
```

### 2. Create Category (Admin Only)
```bash
POST http://localhost:8080/api/categories
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Technology",
  "description": "Tech related posts"
}

# ✅ Success: 201 Created
```

### 3. Try as Regular User (Should Fail)
```bash
# Login as regular user
POST http://localhost:8080/api/auth/login
{
  "username": "john_doe",
  "password": "password123"
}

# Try to create category
POST http://localhost:8080/api/categories
Authorization: Bearer <user-token>
Content-Type: application/json

{
  "name": "New Category",
  "description": "Test"
}

# ❌ Error: 403 Forbidden
# Response: "Access Denied"
```

## Public vs Protected Endpoints

### Public Endpoints (No Authentication Required)
- `GET /api/posts/**` - View posts
- `GET /api/categories` - View all categories
- `GET /api/categories/{id}` - View category by ID
- `GET /api/users` - View all users
- `GET /api/users/{id}` - View user by ID
- `POST /api/auth/**` - Login/Register
- `GET /uploads/**` - View uploaded files

### Admin-Only Endpoints (Requires ADMIN Role)
- `POST /api/users` - Create user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user
- `POST /api/categories` - Create category
- `DELETE /api/categories/{id}` - Delete category

## Creating Admin Users

### Option 1: Via Database
```sql
UPDATE users SET role = 'ADMIN' WHERE username = 'your_username';
```

### Option 2: Via Code (Temporary)
Add to `DataInitializer.java`:
```java
User newAdmin = new User();
newAdmin.setUsername("newadmin");
newAdmin.setEmail("newadmin@lladlad.com");
newAdmin.setPassword(passwordEncoder.encode("password"));
newAdmin.setRole("ADMIN");
newAdmin.setEnabled(true);
userRepository.save(newAdmin);
```

### Option 3: Via API (If you have admin access)
```bash
POST http://localhost:8080/api/users
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "username": "newadmin",
  "email": "newadmin@lladlad.com",
  "password": "password123",
  "role": "ADMIN"
}
```

## Error Responses

### 403 Forbidden (Not Admin)
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 403,
  "error": "Forbidden",
  "message": "Access Denied",
  "path": "/api/categories"
}
```

### 401 Unauthorized (No Token)
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Full authentication is required",
  "path": "/api/users"
}
```

## Frontend Integration

When implementing the frontend, you should:
1. Check user role after login
2. Hide/show admin buttons based on role
3. Handle 403 errors gracefully
4. Show appropriate error messages

Example React code:
```javascript
const isAdmin = user?.role === 'ADMIN';

{isAdmin && (
  <button onClick={createCategory}>Create Category</button>
)}
```

## Security Notes

1. **Always validate on backend**: Frontend role checks are for UX only
2. **Change default admin password**: The default `admin123` password should be changed
3. **Use strong passwords**: Admin accounts should have strong passwords
4. **Monitor admin actions**: Consider adding audit logging for admin operations
5. **Token expiration**: JWT tokens expire after 24 hours (configurable)

## Summary

✅ App name changed to **Lladlad**
✅ Admin-only access for user creation/editing
✅ Admin-only access for category creation/deletion
✅ Public read access maintained
✅ Default admin user created
✅ Security properly configured

All administrative operations are now protected and can only be performed by users with the ADMIN role!



























