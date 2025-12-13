# lladlad - Blog Application

> **LIVE LIKE A DREAM LAD**

A full-stack blog application built with **Spring Boot** (backend) and **React.js** (frontend), featuring authentication, authorization, posts, categories, comments, likes, search, pagination, and YouTube video integration.

![lladlad](https://img.shields.io/badge/lladlad-Blog%20App-blue)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-brightgreen)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![MySQL](https://img.shields.io/badge/MySQL-8.0-orange)

## ✨ Features

### 🔐 Authentication & Authorization
- **JWT-based authentication** - Secure token-based authentication
- **Role-based access control** - ADMIN and USER roles
- **Google OAuth2 integration** - Sign in with Google
- **Password encryption** - BCrypt password hashing
- **Protected routes** - Frontend route protection
- **User profiles** - Customizable user profiles with bio and profile images

### 📝 Content Management
- **Post Management** - Create, read, update, and delete posts
- **Category Management** - Organize posts by categories (Movies, Tech, Dharma, Gaming)
- **Image Upload** - Upload and display images in posts
- **YouTube Integration** - Embed YouTube videos in posts
- **Rich Content** - Support for markdown-style content

### 💬 Social Features
- **Nested Comments** - Comment on posts with reply functionality
- **Like/Favorite Posts** - Like posts and see like counts
- **View Tracking** - Track post views and total site views
- **Reading Progress** - Display reading progress percentage

### 🔍 User Experience
- **Search Functionality** - Search posts by title or content
- **Pagination** - Efficient pagination for large datasets
- **Magazine-style Layout** - Beautiful magazine-style home page
- **Responsive Design** - Mobile-friendly responsive UI
- **Sticky Header** - Scroll-based navbar visibility
- **Modern UI** - Clean, modern design with blue color palette

### ⚡ Performance & Security
- **Caching** - Spring Cache with Caffeine for improved performance
- **Concurrency Control** - Optimistic locking for data consistency
- **Email Notifications** - Email service for notifications
- **CORS Configuration** - Proper CORS setup for frontend-backend communication

## 🛠️ Tech Stack

### Backend
- **Java 17**
- **Spring Boot 3.2.0**
- **Spring Security** - Authentication and authorization
- **Spring Data JPA** - Database operations
- **JWT (JJWT)** - JSON Web Tokens
- **MySQL** - Production database
- **H2** - Development database (optional)
- **Maven** - Build automation
- **Spring Mail** - Email notifications
- **Spring Cache (Caffeine)** - Caching layer
- **BCrypt** - Password encryption

### Frontend
- **React 18**
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API calls
- **React Context API** - Global state management
- **Modern CSS** - Responsive design with custom styling

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Java 17** or higher ([Download](https://www.oracle.com/java/technologies/downloads/))
- **Maven 3.6+** (or use Maven Wrapper included)
- **Node.js 16+** and **npm** ([Download](https://nodejs.org/))
- **MySQL 8.0+** (for production) or use H2 for development
- **Git** (for version control)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd BlogApp
```

### 2. Database Setup

#### Option A: MySQL (Production)

1. **Create MySQL database:**
   ```sql
   CREATE DATABASE blogdb;
   ```

2. **Update `src/main/resources/application.properties`:**
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/blogdb?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
   spring.datasource.username=your-username
   spring.datasource.password=your-password
   ```

#### Option B: H2 (Development - Easier Setup)

The application includes a dev profile that uses H2 in-memory database. No setup required!

### 3. Backend Setup

1. **Navigate to project root:**
   ```bash
   cd BlogApp
   ```

2. **Configure application properties:**
   - Update `src/main/resources/application.properties` with your database credentials
   - Update JWT secret (use a strong secret key in production)
   - Configure email settings (optional)
   - Configure Google OAuth2 (optional)

3. **Build and run the Spring Boot application:**

   **Using Maven Wrapper (Recommended):**
   ```bash
   # Windows
   .\mvnw.cmd spring-boot:run
   
   # Linux/Mac
   ./mvnw spring-boot:run
   ```

   **With Dev Profile (H2 Database):**
   ```bash
   # Windows PowerShell
   $env:SPRING_PROFILES_ACTIVE="dev"; .\mvnw.cmd spring-boot:run
   
   # Windows CMD
   set SPRING_PROFILES_ACTIVE=dev && .\mvnw.cmd spring-boot:run
   
   # Linux/Mac
   SPRING_PROFILES_ACTIVE=dev ./mvnw spring-boot:run
   ```

   **Using Maven (if installed):**
   ```bash
   mvn spring-boot:run
   ```

4. **Backend will start on:** `http://localhost:8080`

5. **Access H2 Console (dev profile only):**
   - URL: `http://localhost:8080/h2-console`
   - JDBC URL: `jdbc:h2:mem:blogdb`
   - Username: `sa`
   - Password: (leave empty)

### 4. Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the React development server:**
   ```bash
   npm start
   ```

4. **Frontend will start on:** `http://localhost:3000`

### 5. Default User Credentials

The application automatically creates default users on startup (only if database is empty):

#### 👤 Admin User
- **Username:** `admin`
- **Email:** `admin@lladlad.com`
- **Password:** `Admin123!@`
- **Role:** `ADMIN`
- **Permissions:** Full access - can create/edit/delete users, categories, subcategories, posts, manage settings, ads, etc.

#### ✏️ Editor User
- **Username:** `editor_user`
- **Email:** `editor@lladlad.com`
- **Password:** `Editor123!@`
- **Role:** `EDITOR`
- **Permissions:** Can create and edit their own posts, upload images, add hashtags and SEO content, select subcategories

#### 👥 Regular Users
- **Username:** `john_doe`
- **Email:** `john@example.com`
- **Password:** `Password123!@`
- **Role:** `USER`
- **Permissions:** Can view posts, comment, like posts, view profiles

- **Username:** `jane_smith`
- **Email:** `jane@example.com`
- **Password:** `Pass123!@`
- **Role:** `USER`
- **Permissions:** Can view posts, comment, like posts, view profiles

**⚠️ Important:** 
- These users are only created if the database is empty (first run)
- Change all default passwords in production!
- For Google OAuth, the email must match an existing user in the database

## 📁 Project Structure

```
BlogApp/
├── src/main/java/com/blogapp/
│   ├── model/              # Entity models (User, Category, Post, Comment, PostLike)
│   ├── repository/         # JPA repositories
│   ├── service/            # Business logic layer
│   ├── controller/         # REST controllers
│   ├── dto/                # Data Transfer Objects
│   ├── security/           # Security configuration (JWT, SecurityConfig)
│   └── config/             # Configuration classes
├── src/main/resources/
│   ├── application.properties      # Production configuration
│   └── application-dev.properties   # Development configuration (H2)
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # React Context (AuthContext)
│   │   ├── services/       # API service layer
│   │   └── App.js          # Main React app
│   └── package.json
├── pom.xml                 # Maven dependencies
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login (returns JWT token)
- `POST /api/auth/register` - User registration
- `GET /api/auth/google/callback` - Google OAuth2 callback

### Posts
- `GET /api/posts` - Get all posts (with pagination)
- `GET /api/posts/{id}` - Get post by ID
- `GET /api/posts/category/{categoryId}` - Get posts by category
- `GET /api/posts/search?query={query}` - Search posts
- `GET /api/posts/views/total` - Get total site views
- `POST /api/posts` - Create new post (authenticated)
- `PUT /api/posts/{id}` - Update post (authenticated)
- `DELETE /api/posts/{id}` - Delete post (authenticated)
- `POST /api/posts/{id}/view` - Increment post view count

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/{id}` - Get category by ID
- `POST /api/categories` - Create category (ADMIN only)
- `PUT /api/categories/{id}` - Update category (ADMIN only)
- `DELETE /api/categories/{id}` - Delete category (ADMIN only)

### Users
- `GET /api/users` - Get all users (ADMIN only)
- `GET /api/users/{id}` - Get user by ID
- `GET /api/users/me` - Get current user profile
- `GET /api/users/profile` - Get user profile (authenticated)
- `POST /api/users` - Create user (ADMIN only)
- `PUT /api/users/{id}` - Update user (ADMIN only)
- `DELETE /api/users/{id}` - Delete user (ADMIN only)
- `GET /api/users/check-email?email={email}` - Check if email exists

### Comments
- `GET /api/comments/post/{postId}` - Get all comments for a post
- `POST /api/comments` - Create comment (authenticated)
- `PUT /api/comments/{id}` - Update comment (authenticated)
- `DELETE /api/comments/{id}` - Delete comment (authenticated)

### Likes
- `POST /api/posts/{postId}/like` - Like/unlike a post (authenticated)
- `GET /api/posts/{postId}/likes` - Get like count for a post

### File Upload
- `POST /api/upload` - Upload image file (authenticated)

## 🔒 Security & Authorization

### Role-Based Access Control

- **ADMIN Role:**
  - Create, update, delete users
  - Create, update, delete categories and subcategories
  - Create, update, delete any posts
  - Manage site settings (social media links, contact email, footer content)
  - Manage ad placements
  - View contact submissions
  - Full access to all endpoints

- **EDITOR Role:**
  - Create and edit their own posts
  - Upload images
  - Add hashtags and SEO metadata (meta title, description, keywords)
  - Select subcategories for posts
  - Use rich text editor (H1, H2, Bold, Italic, etc.)
  - Support for Telugu language in posts
  - Comment on posts
  - Like posts
  - View all posts and categories
  - Cannot delete posts (only admin can)
  - Cannot edit other users' posts

- **USER Role:**
  - View all posts and categories
  - Comment on posts
  - Like posts
  - View user profiles
  - Cannot create or edit posts

### JWT Token

- Tokens are included in the `Authorization` header: `Bearer <token>`
- Token expiration: 24 hours (configurable)
- Tokens are automatically attached to requests via Axios interceptors

## 🎨 Frontend Features

### Components
- **MagazinePostList** - Magazine-style home page layout
- **PostDetail** - Individual post view with comments, likes, and reading progress
- **CommentSection** - Nested comments with reply functionality
- **Sidebar** - Search and category filtering
- **Footer** - Social links and branding
- **UserProfile** - User profile management
- **Login/Register** - Authentication forms

### Styling
- **Color Palette:** Dark blue (`#1e3a8a`) primary, light grey (`#f1f5f9`) accents
- **Responsive Design:** Mobile-first approach with media queries
- **Sticky Header:** Scroll-based visibility
- **Modern UI:** Clean, minimalist design

## 📝 Configuration

### Environment Variables

Create a `.env` file (not committed to git) or update `application.properties`:

```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/blogdb
spring.datasource.username=your-username
spring.datasource.password=your-password

# JWT
jwt.secret=your-secret-key-minimum-256-bits
jwt.expiration=86400000

# Email (optional)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password

# Google OAuth2 (optional)
spring.security.oauth2.client.registration.google.client-id=your-client-id
spring.security.oauth2.client.registration.google.client-secret=your-client-secret
```

## 🧪 Testing

### Backend Testing
```bash
mvn test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 📦 Building for Production

### Backend
```bash
mvn clean package
java -jar target/blog-application-1.0.0.jar
```

### Frontend
```bash
cd frontend
npm run build
```

The production build will be in `frontend/build/` directory.

## 🐛 Troubleshooting

### Common Issues

1. **Port 8080 already in use:**
   - Change `server.port` in `application.properties`
   - Or stop the process using port 8080

2. **MySQL connection error:**
   - Verify MySQL is running
   - Check database credentials
   - Ensure database `blogdb` exists

3. **CORS errors:**
   - Verify backend CORS configuration allows `http://localhost:3000`
   - Check browser console for specific CORS errors

4. **JWT token expired:**
   - Log in again to get a new token
   - Increase `jwt.expiration` in `application.properties`

## 📚 Additional Documentation

- **[User Credentials](CREDENTIALS.md)** - Default login credentials for all user roles (Admin, Editor, User)
- [JWT Classes Explanation](JWT_CLASSES_EXPLANATION.md)
- [Frontend Step-by-Step Guide](FRONTEND_STEP_BY_STEP_GUIDE.md)
- [Backend Features](BACKEND_FEATURES.md)
- [Caching and Concurrency](CACHING_AND_CONCURRENCY.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available for learning purposes.

## 👤 Author

**lladlad Team**

- Tagline: **LIVE LIKE A DREAM LAD**

## 🙏 Acknowledgments

- Spring Boot team for the amazing framework
- React team for the powerful frontend library
- All open-source contributors

---

**Made with ❤️ by lladlad**
