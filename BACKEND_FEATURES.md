# Backend Features Documentation

## ✅ Completed Features

### 1. Database Migration to MySQL
- ✅ Updated `pom.xml` with MySQL driver
- ✅ Updated `application.properties` with MySQL configuration
- ✅ Created `application-dev.properties` for H2 development option
- **Database URL**: `jdbc:mysql://localhost:3306/blogdb?sslmode=disable`
- **Default credentials**: `root/root` (change in production)

### 2. Spring Security with JWT Authentication
- ✅ JWT token generation and validation
- ✅ Password encryption using BCrypt
- ✅ Custom user details service
- ✅ JWT authentication filter
- ✅ Security configuration with CORS support
- **Endpoints**:
  - `POST /api/auth/login` - Login and get JWT token
  - `POST /api/auth/register` - Register new user

### 3. Enhanced User Management
- ✅ Password encryption (BCrypt)
- ✅ User profile fields (firstName, lastName, bio, profileImage)
- ✅ User roles (USER, ADMIN)
- ✅ Email notifications on user creation
- ✅ Updated UserDTO with all profile fields

### 4. Image Upload Functionality
- ✅ File storage service
- ✅ Image upload endpoint: `POST /api/upload/image`
- ✅ File validation (image types only)
- ✅ Static resource serving at `/uploads/**`
- ✅ Post entity updated with `imagePath` field

### 5. Search Functionality
- ✅ Full-text search in post title and content
- ✅ Search by category (optional filter)
- ✅ Case-insensitive search
- ✅ Paginated search results
- **Endpoint**: `GET /api/posts/search?keyword=...&categoryId=...&page=0&size=10`

### 6. Pagination
- ✅ Pagination support for all list endpoints
- ✅ PageResponse DTO for consistent pagination
- ✅ Default page size: 10
- **Endpoints with pagination**:
  - `GET /api/posts?page=0&size=10`
  - `GET /api/posts/category/{id}?page=0&size=10`
  - `GET /api/posts/user/{id}?page=0&size=10`
  - `GET /api/comments/post/{id}?page=0&size=10`

### 7. Comments System
- ✅ Comment entity with relationships
- ✅ CRUD operations for comments
- ✅ Paginated comment listing
- ✅ Comment count per post
- **Endpoints**:
  - `GET /api/comments/post/{postId}?page=0&size=10`
  - `POST /api/comments` - Create comment
  - `PUT /api/comments/{id}` - Update comment
  - `DELETE /api/comments/{id}` - Delete comment

### 8. Like/Favorite Functionality
- ✅ PostLike entity with unique constraint (user + post)
- ✅ Toggle like/unlike functionality
- ✅ Like count per post
- ✅ Check if user liked a post
- **Endpoints**:
  - `POST /api/likes/toggle` - Toggle like
  - `GET /api/likes/post/{postId}/user/{userId}` - Check if liked
  - `GET /api/likes/post/{postId}/count` - Get like count

### 9. Email Notification Service
- ✅ Email service with Spring Mail
- ✅ Welcome email on user registration
- ✅ New post notification (ready for implementation)
- ✅ Configurable SMTP settings in `application.properties`
- **Note**: Update email credentials in `application.properties`

### 10. Enhanced Post Features
- ✅ Image support in posts
- ✅ Comment count in PostDTO
- ✅ Like count in PostDTO
- ✅ Liked status for authenticated users
- ✅ Updated PostDTO with all new fields

## API Endpoints Summary

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register

### Posts
- `GET /api/posts` - Get all posts (with optional pagination)
- `GET /api/posts/search` - Search posts
- `GET /api/posts/{id}` - Get post by ID
- `GET /api/posts/category/{categoryId}` - Get posts by category
- `GET /api/posts/user/{userId}` - Get posts by user
- `POST /api/posts` - Create post
- `PUT /api/posts/{id}` - Update post
- `DELETE /api/posts/{id}` - Delete post

### Comments
- `GET /api/comments/post/{postId}` - Get comments for post
- `POST /api/comments` - Create comment
- `PUT /api/comments/{id}` - Update comment
- `DELETE /api/comments/{id}` - Delete comment

### Likes
- `POST /api/likes/toggle` - Toggle like
- `GET /api/likes/post/{postId}/user/{userId}` - Check if liked
- `GET /api/likes/post/{postId}/count` - Get like count

### File Upload
- `POST /api/upload/image` - Upload image

### Users & Categories
- All existing endpoints remain functional

## Configuration

### MySQL Setup
1. Install MySQL (8.0 or higher recommended)
2. Create database: `CREATE DATABASE blogdb;`
3. Update `application.properties` with your credentials:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/blogdb
   spring.datasource.username=root
   spring.datasource.password=your_password
   ```

### Email Configuration
Update in `application.properties`:
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
```

### JWT Configuration
Update in `application.properties`:
```properties
jwt.secret=your-secret-key-change-this-in-production-minimum-256-bits
jwt.expiration=86400000
```

### File Upload
- Upload directory: `uploads/` (created automatically)
- Max file size: 10MB
- Supported types: Images only

## Security Notes
- All passwords are encrypted with BCrypt
- JWT tokens expire after 24 hours (configurable)
- Public endpoints: `/api/auth/**`, `/api/posts/**`, `/api/categories/**`
- Protected endpoints: User management (can be configured)

## Next Steps for Frontend
1. Add authentication UI (login/register)
2. Add image upload component
3. Add search bar
4. Add pagination controls
5. Add comments section
6. Add like button
7. Update post form with image upload



