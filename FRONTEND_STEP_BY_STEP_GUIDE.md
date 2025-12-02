# Frontend Step-by-Step Guide - Complete Explanation

## 📚 Table of Contents
1. [React Basics - What You Need to Know](#react-basics)
2. [Project Structure](#project-structure)
3. [How Frontend Connects to Backend](#backend-connection)
4. [Entry Point - index.js](#entry-point)
5. [Main App Component - App.js](#main-app)
6. [Authentication System](#authentication)
7. [API Service Layer](#api-service)
8. [Components Explained](#components)
9. [Routing System](#routing)
10. [State Management](#state-management)
11. [Complete Flow Examples](#complete-flows)

---

## React Basics - What You Need to Know {#react-basics}

### What is React?
React is a JavaScript library for building user interfaces. Think of it as building blocks (components) that you combine to create a website.

### Key Concepts:

#### 1. **Components**
- Like LEGO blocks - reusable pieces of UI
- Example: A button, a form, a list of posts
- Each component is a JavaScript function that returns HTML (JSX)

```javascript
// Simple Component Example
function Welcome() {
  return <h1>Hello, World!</h1>;
}
```

#### 2. **JSX (JavaScript XML)**
- Looks like HTML but it's JavaScript
- Allows you to write HTML-like code in JavaScript

```javascript
// JSX Example
const element = <h1>Hello, {name}!</h1>;
```

#### 3. **Props (Properties)**
- Data passed from parent to child component
- Like function parameters

```javascript
// Parent passes data to child
<PostList posts={allPosts} />

// Child receives it
function PostList({ posts }) {
  return <div>{posts.map(post => <Post key={post.id} data={post} />)}</div>;
}
```

#### 4. **State**
- Data that can change over time
- When state changes, React re-renders the component

```javascript
const [count, setCount] = useState(0); // count starts at 0
setCount(5); // Now count is 5, component re-renders
```

#### 5. **Hooks**
- Functions that let you use React features
- `useState` - for state management
- `useEffect` - for side effects (API calls, timers)
- `useContext` - for accessing context

```javascript
useEffect(() => {
  // This runs when component mounts or dependencies change
  fetchData();
}, [dependency]);
```

---

## Project Structure {#project-structure}

```
frontend/
├── public/
│   └── index.html          # Main HTML file
├── src/
│   ├── index.js            # Entry point - starts React app
│   ├── App.js              # Main app component - routing
│   ├── App.css             # Global styles
│   ├── context/
│   │   └── AuthContext.js  # Authentication state management
│   ├── services/
│   │   └── api.js          # All API calls to backend
│   └── components/
│       ├── PostList.js     # Shows all posts
│       ├── PostDetail.js   # Shows single post
│       ├── PostForm.js     # Create/edit post form
│       ├── Login.js        # Login form
│       ├── Register.js     # Registration form
│       ├── UserProfile.js  # User profile page
│       ├── CategoryList.js # Category management
│       ├── UserList.js     # User management (admin)
│       ├── CommentSection.js # Comments with replies
│       ├── ProtectedRoute.js # Route protection
│       └── YouTubeEmbed.js  # YouTube video embed
```

---

## How Frontend Connects to Backend {#backend-connection}

### The Connection Flow:

```
Frontend (React)          Backend (Spring Boot)
     │                            │
     │  1. User clicks button    │
     │───────────────────────────>│
     │                            │
     │  2. API call (HTTP)        │
     │  GET /api/posts            │
     │───────────────────────────>│
     │                            │
     │  3. Backend processes      │
     │  (queries database)         │
     │                            │
     │  4. Returns JSON data      │
     │  [{id: 1, title: "..."}]   │
     │<───────────────────────────│
     │                            │
     │  5. Frontend receives      │
     │  Updates UI                │
     │                            │
```

### Key Points:
1. **Frontend runs on**: `http://localhost:3000` (React dev server)
2. **Backend runs on**: `http://localhost:8080` (Spring Boot)
3. **Communication**: HTTP requests (GET, POST, PUT, DELETE)
4. **Data Format**: JSON (JavaScript Object Notation)

---

## Entry Point - index.js {#entry-point}

**File**: `frontend/src/index.js`

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Find the div with id="root" in public/index.html
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the App component into that div
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### What This Does:
1. **Imports React**: The React library
2. **Imports ReactDOM**: For rendering to the DOM (Document Object Model)
3. **Finds root element**: Looks for `<div id="root">` in `public/index.html`
4. **Renders App**: Puts the `App` component into that div
5. **StrictMode**: Helps find potential problems (development only)

### Flow:
```
index.html (has <div id="root">)
    ↓
index.js (renders App into root)
    ↓
App.js (main application)
```

---

## Main App Component - App.js {#main-app}

**File**: `frontend/src/App.js`

### Structure Breakdown:

```javascript
// 1. IMPORTS - Bring in what we need
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
```

**Explanation:**
- `BrowserRouter`: Enables routing (navigation between pages)
- `Routes, Route`: Define which component shows for which URL
- `AuthProvider`: Wraps app to provide authentication state
- `useAuth`: Hook to access authentication data

### Component Hierarchy:

```javascript
App (outermost)
  └─ Router (enables routing)
      └─ AuthProvider (provides auth state)
          └─ AppContent
              ├─ Navbar (navigation bar)
              └─ Routes (different pages)
                  ├─ PostList (/)
                  ├─ Login (/login)
                  ├─ PostForm (/posts/new)
                  └─ ... (other routes)
```

### Navbar Component:

```javascript
function Navbar() {
  const { user, logout, isAdmin } = useAuth(); // Get auth data
  const navigate = useNavigate(); // For programmatic navigation

  const handleLogout = () => {
    logout(); // Clear user data
    navigate('/login'); // Go to login page
  };

  return (
    <nav className="navbar">
      <Link to="/">📝 Lladlad</Link>
      <div className="nav-menu">
        <Link to="/">Posts</Link>
        {isAdmin() && <Link to="/users">Users</Link>} {/* Only show if admin */}
        {user ? (
          <button onClick={handleLogout}>Logout</button>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </nav>
  );
}
```

**Key Points:**
- `useAuth()`: Gets current user and auth functions
- Conditional rendering: `{user ? ... : ...}` shows different things based on login status
- `isAdmin()`: Checks if user is admin

### Routing Setup:

```javascript
<Routes>
  {/* Public routes - anyone can access */}
  <Route path="/" element={<PostList />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  
  {/* Protected routes - need login */}
  <Route 
    path="/posts/new" 
    element={
      <ProtectedRoute>
        <PostForm />
      </ProtectedRoute>
    } 
  />
  
  {/* Admin-only routes */}
  <Route 
    path="/users" 
    element={
      <ProtectedRoute requireAdmin={true}>
        <UserList />
      </ProtectedRoute>
    } 
  />
</Routes>
```

**Explanation:**
- `path="/"`: URL path (home page)
- `element={<PostList />}`: Component to show
- `ProtectedRoute`: Wrapper that checks if user is logged in
- `requireAdmin={true}`: Also checks if user is admin

---

## Authentication System {#authentication}

### AuthContext - Global State Management

**File**: `frontend/src/context/AuthContext.js`

### What is Context?
Think of it as a **global storage** that any component can access. Like a shared box that all components can read from and write to.

### How It Works:

```javascript
// 1. Create Context (empty box)
const AuthContext = createContext(null);

// 2. Provider Component (fills the box)
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Current user data
  const [token, setToken] = useState(localStorage.getItem('token')); // JWT token
  
  // Login function
  const login = async (username, password) => {
    const response = await authApi.login({ username, password });
    const { token: newToken, ...userData } = response.data;
    setToken(newToken); // Save token
    setUser(userData); // Save user data
    localStorage.setItem('token', newToken); // Store in browser
    return { success: true };
  };
  
  // Logout function
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token'); // Remove from browser
  };
  
  // Check if user is admin
  const isAdmin = () => {
    return user?.role === 'ADMIN';
  };
  
  // Provide all this to children
  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Hook to use context (access the box)
export const useAuth = () => {
  const context = useContext(AuthContext);
  return context; // Returns { user, token, login, logout, isAdmin }
};
```

### Using AuthContext in Components:

```javascript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, logout, isAdmin } = useAuth(); // Get auth data
  
  if (!user) {
    return <div>Please login</div>;
  }
  
  return (
    <div>
      <p>Welcome, {user.username}!</p>
      {isAdmin() && <AdminPanel />}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Token Storage:
- **localStorage**: Browser storage that persists even after closing browser
- Token is saved after login: `localStorage.setItem('token', token)`
- Token is sent with every API request (automatic via axios interceptor)

---

## API Service Layer {#api-service}

**File**: `frontend/src/services/api.js`

### What is Axios?
Axios is a library for making HTTP requests. It's like a messenger between frontend and backend.

### Setup:

```javascript
import axios from 'axios';

// Create axios instance with base URL
const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

**Explanation:**
- `baseURL`: All requests start with this URL
- So `api.get('/posts')` becomes `http://localhost:8080/api/posts`

### Automatic Token Injection:

```javascript
// Request interceptor - runs before every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Get token from storage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Add to header
    }
    return config;
  }
);
```

**What This Does:**
- Before every API call, automatically adds the JWT token
- Backend can verify the user is logged in
- No need to manually add token to each request

### Automatic Logout on 401:

```javascript
// Response interceptor - runs after every response
api.interceptors.response.use(
  (response) => response, // If success, return response
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login'; // Redirect to login
    }
    return Promise.reject(error);
  }
);
```

**What This Does:**
- If backend returns 401 (Unauthorized), token is invalid
- Automatically removes token and redirects to login

### API Functions:

```javascript
// Posts API
export const getPosts = () => api.get('/posts');
// GET http://localhost:8080/api/posts

export const getPost = (id) => api.get(`/posts/${id}`);
// GET http://localhost:8080/api/posts/1

export const createPost = (postData) => api.post('/posts', postData);
// POST http://localhost:8080/api/posts
// Body: { title: "...", content: "..." }

export const deletePost = (id) => api.delete(`/posts/${id}`);
// DELETE http://localhost:8080/api/posts/1
```

**HTTP Methods:**
- `GET`: Retrieve data (read)
- `POST`: Create new data
- `PUT`: Update existing data
- `DELETE`: Remove data

---

## Components Explained {#components}

### 1. Login Component

**File**: `frontend/src/components/Login.js`

```javascript
function Login() {
  const [username, setUsername] = useState(''); // Form state
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { login } = useAuth(); // Get login function
  const navigate = useNavigate(); // For navigation

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page refresh
    
    const result = await login(username, password); // Call login
    
    if (result.success) {
      navigate('/'); // Go to home page
    } else {
      setError(result.error); // Show error
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Login</button>
      {error && <div className="error">{error}</div>}
    </form>
  );
}
```

**Flow:**
1. User enters username/password
2. Clicks "Login" button
3. `handleSubmit` runs
4. Calls `login()` from AuthContext
5. AuthContext calls backend API
6. Backend returns token + user data
7. Token saved to localStorage
8. User redirected to home page

### 2. PostList Component

**File**: `frontend/src/components/PostList.js`

```javascript
function PostList() {
  const [posts, setPosts] = useState([]); // Store posts
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPosts(); // Load posts when component mounts
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await getPosts(); // API call
      setPosts(response.data); // Update state
      setError(null);
    } catch (err) {
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <h1>All Posts</h1>
      {posts.map(post => (
        <div key={post.id} className="card">
          <h2>{post.title}</h2>
          <p>{post.content}</p>
        </div>
      ))}
    </div>
  );
}
```

**Key Concepts:**
- **useState**: Stores component data (posts, loading, error)
- **useEffect**: Runs code when component mounts (like `componentDidMount`)
- **async/await**: Handles asynchronous operations (API calls)
- **map()**: Loops through array and renders each item

**Flow:**
1. Component mounts
2. `useEffect` runs → calls `loadPosts()`
3. `getPosts()` API call to backend
4. Backend returns array of posts
5. `setPosts()` updates state
6. React re-renders with new data
7. Posts displayed on screen

### 3. PostForm Component

**File**: `frontend/src/components/PostForm.js`

```javascript
function PostForm() {
  const { user } = useAuth(); // Get current user
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const postData = {
      title,
      content,
      authorId: user.id, // Use logged-in user
      categoryId: selectedCategory
    };
    
    await createPost(postData); // API call
    navigate('/'); // Go back to posts list
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Post Title"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Post Content"
      />
      <button type="submit">Create Post</button>
    </form>
  );
}
```

**Key Points:**
- Uses `user.id` from AuthContext (no manual user selection)
- Form state managed with `useState`
- On submit, sends data to backend
- After success, navigates back to list

### 4. ProtectedRoute Component

**File**: `frontend/src/components/ProtectedRoute.js`

```javascript
function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return <div>Loading...</div>; // Still checking auth
  }

  if (!user) {
    navigate('/login'); // Not logged in, redirect
    return null;
  }

  if (requireAdmin && !isAdmin()) {
    return <div>Access Denied. Admin only.</div>; // Not admin
  }

  return children; // User is logged in (and admin if required)
}
```

**How It Works:**
1. Checks if user is logged in
2. If not, redirects to login
3. If `requireAdmin={true}`, also checks admin status
4. If all checks pass, renders the child component

**Usage:**
```javascript
<ProtectedRoute>
  <PostForm /> {/* Only logged-in users can see this */}
</ProtectedRoute>

<ProtectedRoute requireAdmin={true}>
  <UserList /> {/* Only admins can see this */}
</ProtectedRoute>
```

### 5. CommentSection Component

**File**: `frontend/src/components/CommentSection.js`

```javascript
function CommentSection({ postId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    loadComments(); // Load when component mounts
  }, [postId]); // Reload if postId changes

  const loadComments = async () => {
    const response = await getAllComments(postId); // API call
    setComments(response.data); // Update state
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    await createComment({
      postId: parseInt(postId),
      userId: user.id,
      content: newComment
    });
    setNewComment(''); // Clear input
    loadComments(); // Reload comments
  };

  return (
    <div>
      <h3>Comments</h3>
      {user && (
        <form onSubmit={handleCommentSubmit}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button type="submit">Post Comment</button>
        </form>
      )}
      {comments.map(comment => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  );
}
```

**Key Features:**
- Receives `postId` as prop (from parent component)
- Loads comments for that specific post
- Only logged-in users can comment
- Recursively renders nested replies

---

## Routing System {#routing}

### How React Router Works:

```javascript
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
```

### Navigation Methods:

#### 1. **Link Component** (for navigation in JSX)
```javascript
<Link to="/posts/new">Create Post</Link>
// Renders as: <a href="/posts/new">Create Post</a>
// But doesn't refresh page (single-page app)
```

#### 2. **useNavigate Hook** (for programmatic navigation)
```javascript
const navigate = useNavigate();
navigate('/login'); // Go to login page
navigate(-1); // Go back
```

### Route Parameters:

```javascript
<Route path="/posts/:id" element={<PostDetail />} />
// URL: /posts/123
// In PostDetail component:
const { id } = useParams(); // id = "123"
```

### Complete Routing Example:

```javascript
<Routes>
  {/* Exact match */}
  <Route path="/" element={<PostList />} />
  
  {/* With parameter */}
  <Route path="/posts/:id" element={<PostDetail />} />
  
  {/* Nested routes */}
  <Route path="/admin">
    <Route path="users" element={<UserList />} />
    <Route path="settings" element={<Settings />} />
  </Route>
</Routes>
```

---

## State Management {#state-management}

### Three Levels of State:

#### 1. **Local State** (Component-level)
```javascript
const [count, setCount] = useState(0);
// Only this component can access
```

#### 2. **Context State** (App-level)
```javascript
// In AuthContext
const [user, setUser] = useState(null);
// Any component can access via useAuth()
```

#### 3. **Props** (Parent-to-child)
```javascript
// Parent
<PostList posts={allPosts} />

// Child
function PostList({ posts }) {
  // Can use posts here
}
```

### When to Use What:

- **Local State**: Data only one component needs (form inputs, UI state)
- **Context**: Data multiple components need (user, theme, language)
- **Props**: Data passed from parent to child

---

## Complete Flow Examples {#complete-flows}

### Flow 1: User Login

```
1. User opens /login page
   ↓
2. Login component renders
   ↓
3. User enters username/password
   ↓
4. Clicks "Login" button
   ↓
5. handleSubmit() runs
   ↓
6. Calls login() from AuthContext
   ↓
7. AuthContext calls: authApi.login({ username, password })
   ↓
8. api.js sends POST request to http://localhost:8080/api/auth/login
   ↓
9. Backend (AuthController) receives request
   ↓
10. Backend validates credentials
   ↓
11. Backend generates JWT token
   ↓
12. Backend returns: { token: "...", user: {...} }
   ↓
13. Frontend receives response
   ↓
14. AuthContext saves token to localStorage
   ↓
15. AuthContext updates user state
   ↓
16. navigate('/') redirects to home
   ↓
17. PostList component loads
   ↓
18. PostList calls getPosts() API
   ↓
19. API automatically adds token to request header
   ↓
20. Backend verifies token
   ↓
21. Backend returns posts
   ↓
22. Posts displayed on screen
```

### Flow 2: Creating a Post

```
1. User clicks "New Post" link
   ↓
2. ProtectedRoute checks if user is logged in
   ↓
3. If logged in, shows PostForm component
   ↓
4. User fills in title, content, selects category
   ↓
5. Clicks "Create Post" button
   ↓
6. handleSubmit() runs
   ↓
7. Creates postData object:
   {
     title: "...",
     content: "...",
     authorId: user.id,
     categoryId: selectedCategory
   }
   ↓
8. Calls createPost(postData)
   ↓
9. api.js sends POST to http://localhost:8080/api/posts
   ↓
10. Request includes Authorization header with JWT token
   ↓
11. Backend (PostController) receives request
   ↓
12. Backend verifies token (SecurityConfig)
   ↓
13. Backend creates Post entity
   ↓
14. Backend saves to database
   ↓
15. Backend returns created post
   ↓
16. Frontend receives response
   ↓
17. navigate('/') redirects to home
   ↓
18. PostList reloads and shows new post
```

### Flow 3: Viewing Post Details

```
1. User clicks "Read More" on a post
   ↓
2. Link navigates to /posts/123
   ↓
3. PostDetail component mounts
   ↓
4. useParams() extracts id = "123"
   ↓
5. useEffect runs, calls loadPost()
   ↓
6. Calls getPost(123)
   ↓
7. API: GET http://localhost:8080/api/posts/123
   ↓
8. Backend finds post with id 123
   ↓
9. Backend returns post data
   ↓
10. Frontend sets post state
   ↓
11. Component renders post details
   ↓
12. CommentSection component also loads
   ↓
13. CommentSection calls getAllComments(123)
   ↓
14. Backend returns comments with nested replies
   ↓
15. Comments displayed below post
```

### Flow 4: Adding a Comment

```
1. User scrolls to comments section
   ↓
2. User types comment in textarea
   ↓
3. Clicks "Post Comment" button
   ↓
4. handleCommentSubmit() runs
   ↓
5. Creates commentData:
   {
     postId: 123,
     userId: user.id,
     content: "Great post!"
   }
   ↓
6. Calls createComment(commentData)
   ↓
7. API: POST http://localhost:8080/api/comments
   ↓
8. Backend receives request
   ↓
9. Backend creates Comment entity
   ↓
10. Backend saves to database
   ↓
11. Backend returns created comment
   ↓
12. Frontend receives response
   ↓
13. loadComments() called again
   ↓
14. New comment appears in list
```

---

## Common Patterns

### Pattern 1: Loading State

```javascript
const [loading, setLoading] = useState(true);

useEffect(() => {
  loadData();
}, []);

const loadData = async () => {
  setLoading(true);
  try {
    const response = await getData();
    setData(response.data);
  } finally {
    setLoading(false);
  }
};

if (loading) return <div>Loading...</div>;
return <div>{/* Show data */}</div>;
```

### Pattern 2: Error Handling

```javascript
const [error, setError] = useState(null);

try {
  await someApiCall();
} catch (err) {
  setError(err.response?.data || 'Something went wrong');
}

{error && <div className="error">{error}</div>}
```

### Pattern 3: Conditional Rendering

```javascript
{user ? (
  <div>Welcome, {user.username}!</div>
) : (
  <div>Please login</div>
)}

{isAdmin() && <AdminPanel />}
```

### Pattern 4: Form Handling

```javascript
const [formData, setFormData] = useState({ title: '', content: '' });

const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value
  });
};

const handleSubmit = async (e) => {
  e.preventDefault();
  await createPost(formData);
};
```

---

## Tips for Understanding Frontend

1. **Start with the Flow**: Follow data from user action → component → API → backend → response → UI update

2. **Read from Top to Bottom**: 
   - index.js → App.js → Components
   - Each component: imports → state → functions → render

3. **Use Browser DevTools**:
   - F12 → Console: See errors and logs
   - Network tab: See API calls
   - React DevTools: Inspect components

4. **Console.log is Your Friend**:
   ```javascript
   console.log('User:', user);
   console.log('Posts:', posts);
   ```

5. **Understand the Data Flow**:
   - User action → State change → Re-render → UI update

---

## Quick Reference

### Importing and Using:

```javascript
// Import component
import PostList from './components/PostList';

// Import hook
import { useAuth } from './context/AuthContext';

// Import API function
import { getPosts } from './services/api';

// Use in component
function MyComponent() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  
  useEffect(() => {
    loadPosts();
  }, []);
  
  const loadPosts = async () => {
    const response = await getPosts();
    setPosts(response.data);
  };
  
  return <div>{/* JSX */}</div>;
}
```

### Common Hooks:

```javascript
// State
const [value, setValue] = useState(initialValue);

// Effect (runs on mount/update)
useEffect(() => {
  // Code here
}, [dependencies]);

// Context
const { user, login } = useAuth();

// Navigation
const navigate = useNavigate();
navigate('/path');

// Route params
const { id } = useParams();
```

---

## Summary

1. **React** = Building blocks (components) that create UI
2. **State** = Data that changes and triggers re-renders
3. **Props** = Data passed from parent to child
4. **Context** = Global state accessible by all components
5. **API Service** = Functions that talk to backend
6. **Routing** = Navigation between pages
7. **Hooks** = Functions to use React features

**The Flow:**
User Action → Component Function → API Call → Backend → Response → State Update → Re-render → UI Update

This is the complete picture of how the frontend works! 🎉


