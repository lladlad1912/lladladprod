import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { getTotalSiteViews } from './services/api';
import './App.css';
import PostList from './components/PostList';
import MagazinePostList from './components/MagazinePostList';
import Footer from './components/Footer';
import PostForm from './components/PostForm';
import PostDetail from './components/PostDetail';
import CategoryList from './components/CategoryList';
import UserList from './components/UserList';
import Login from './components/Login';
import Register from './components/Register';
import UserProfile from './components/UserProfile';
import ProtectedRoute from './components/ProtectedRoute';
import Logo from './components/Logo';

function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const [searchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || null;

  useEffect(() => {
    // Load total site views
    const loadTotalViews = async () => {
      try {
        const response = await getTotalSiteViews();
        setTotalViews(response.data.totalViews || 0);
      } catch (err) {
        console.error('Failed to load total views:', err);
      }
    };
    loadTotalViews();
    // Refresh every 30 seconds
    const interval = setInterval(loadTotalViews, 30000);
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show navbar when scrolling up, hide when scrolling down
      if (currentScrollY < 100) {
        // Always show at top
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        // Scrolling down - hide
        setIsVisible(false);
      } else {
        // Scrolling up - show
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, [lastScrollY]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className={`navbar ${isVisible ? 'navbar-visible' : 'navbar-hidden'}`}>
      <div className="nav-container">
        <div className="nav-brand">
          <Link to="/" className="nav-logo">
            <Logo size={20} />
            <span>lladlad</span>
          </Link>
          <div className="nav-brand-info">
            <p className="nav-tagline">LIVE LIKE A DREAM LAD</p>
            <p className="nav-views">
              <span className="nav-views-icon">👁</span>
              <strong>{totalViews.toLocaleString()}</strong> views
            </p>
          </div>
        </div>
        <div className="nav-menu">
          <div className="nav-categories">
            <Link 
              to="/?category=Movies" 
              className={`nav-category-link ${activeCategory === 'Movies' ? 'active' : ''}`}
            >
              Movies
            </Link>
            <Link 
              to="/?category=Tech" 
              className={`nav-category-link ${activeCategory === 'Tech' ? 'active' : ''}`}
            >
              Tech
            </Link>
            <Link 
              to="/?category=Dharma" 
              className={`nav-category-link ${activeCategory === 'Dharma' ? 'active' : ''}`}
            >
              Dharma
            </Link>
            <Link 
              to="/?category=Gaming" 
              className={`nav-category-link ${activeCategory === 'Gaming' ? 'active' : ''}`}
            >
              Gaming
            </Link>
            <span className="nav-category-separator">|</span>
            <Link 
              to="/" 
              className={`nav-category-link ${!activeCategory ? 'active' : ''}`}
            >
              All Posts
            </Link>
          </div>
          {isAdmin() && (
            <Link to="/users" className="nav-link">Users</Link>
          )}
          {user && (
            <>
              <Link to="/posts/new" className="nav-link">New Post</Link>
              <Link to="/profile" className="nav-link">Profile</Link>
            </>
          )}
          {/* Social Media Links */}
          <div className="nav-social">
            <a 
              href="https://facebook.com/lladlad" 
              target="_blank" 
              rel="noopener noreferrer"
              className="nav-social-link"
              title="Facebook"
            >
              📘
            </a>
            <a 
              href="https://instagram.com/lladlad" 
              target="_blank" 
              rel="noopener noreferrer"
              className="nav-social-link"
              title="Instagram"
            >
              📷
            </a>
          </div>
          {user ? (
            <button 
              onClick={handleLogout}
              className="nav-link"
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
            >
              Logout ({user.username})
            </button>
          ) : (
            <Link to="/login" className="nav-link">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}

function AppContent() {
  return (
    <div className="App">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<MagazinePostList />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/posts/new" 
            element={
              <ProtectedRoute>
                <PostForm />
              </ProtectedRoute>
            } 
          />
          <Route path="/posts/:id" element={<PostDetail />} />
          <Route path="/categories" element={<CategoryList />} />
          <Route 
            path="/users" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <UserList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;

