import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SidebarProvider, useSidebar } from './context/SidebarContext';
import { getTotalSiteViews, getAllSettings, getCategories, getSubCategoriesByCategory, searchPosts, searchAll } from './services/api';
import './App.css';
import PostList from './components/PostList';
import MagazinePostList from './components/MagazinePostList';
import Footer from './components/Footer';
import PostForm from './components/PostForm';
import PostDetail from './components/PostDetail';
import CategoryList from './components/CategoryList';
import SubCategoryList from './components/SubCategoryList';
import UserList from './components/UserList';
import Login from './components/Login';
import Register from './components/Register';
import UserProfile from './components/UserProfile';
import { FacebookIcon, InstagramIcon, TwitterIcon } from './components/SocialIcons';
import ProtectedRoute from './components/ProtectedRoute';
import Logo from './components/Logo';
import AdminSettings from './components/AdminSettings';
import AdminAds from './components/AdminAds';
import WriteForLladlad from './components/WriteForLladlad';
import PostStatistics from './components/PostStatistics';
import PostmarksPage from './components/PostmarksPage';
import ProfileSetup from './components/ProfileSetup';
import PostReviewPage from './components/PostReviewPage';
import SEO from './components/SEO';

function Navbar() {
  const { user, logout, isAdmin, isEditor } = useAuth();
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const [settings, setSettings] = useState({});
  const [categories, setCategories] = useState([]);
  const [subCategoriesMap, setSubCategoriesMap] = useState({});
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchType, setSearchType] = useState('all'); // all, posts, users, categories
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

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
    
    // Load site settings for social links
    const loadSettings = async () => {
      try {
        const response = await getAllSettings();
        setSettings(response.data);
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    };
    
    // Load categories and subcategories
    const loadCategories = async () => {
      try {
        const response = await getCategories();
        const categoriesData = response.data;
        setCategories(categoriesData);
        
        // Load subcategories for each category
        const subCategoriesPromises = categoriesData.map(async (category) => {
          try {
            const subResponse = await getSubCategoriesByCategory(category.id);
            return { categoryId: category.id, subCategories: subResponse.data };
          } catch (err) {
            console.error(`Failed to load subcategories for category ${category.id}:`, err);
            return { categoryId: category.id, subCategories: [] };
          }
        });
        
        const subCategoriesResults = await Promise.all(subCategoriesPromises);
        const subCategoriesMap = {};
        subCategoriesResults.forEach(({ categoryId, subCategories }) => {
          subCategoriesMap[categoryId] = subCategories;
        });
        setSubCategoriesMap(subCategoriesMap);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    
    loadTotalViews();
    loadSettings();
    loadCategories();
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

  const handleSearch = async () => {
    if (!searchKeyword.trim()) return;
    
    try {
      setSearching(true);
      // Use unified search
      const response = await searchAll(
        searchKeyword.trim(),
        searchType,
        0,
        20
      );
      // Navigate to home with search params
      const params = new URLSearchParams();
      if (searchKeyword.trim()) {
        params.set('search', searchKeyword.trim());
        params.set('type', searchType);
      }
      navigate(`/?${params.toString()}`);
      setSearchExpanded(false);
      setShowFilterDropdown(false);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchKeyword('');
    setSearchExpanded(false);
    setSearchType('all');
    setShowFilterDropdown(false);
    navigate('/');
  };

  const handleSearchIconClick = () => {
    setSearchExpanded(true);
  };

  return (
    <nav className={`navbar ${isVisible ? 'navbar-visible' : 'navbar-hidden'}`}>
      <div className="nav-container">
        <div className="nav-brand">
          <button 
            className={`sidebar-toggle ${sidebarOpen ? 'open' : ''}`}
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <div className="hamburger-icon">
              <span className="hamburger-line line-top"></span>
              <span className="hamburger-line line-middle"></span>
              <span className="hamburger-line line-bottom"></span>
            </div>
          </button>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
            <Link to="/" className="nav-logo">
              <Logo size={20} />
              <span>lladlad</span>
            </Link>
            <p className="nav-tagline">LIVE LIKE A DREAM LAD</p>
          </div>
          <div className={`nav-search ${searchExpanded ? 'expanded' : ''}`}>
            {!searchExpanded ? (
              <>
                <button 
                  onClick={handleSearchIconClick}
                  className="nav-search-icon-button"
                  title="Search"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                </button>
                <button 
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className="nav-search-icon-button"
                  title="Filter"
                  style={{ position: 'relative' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                  </svg>
                  {showFilterDropdown && (
                    <div 
                      className="filter-dropdown"
                      style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: '0.5rem',
                        background: 'white',
                        borderRadius: '6px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        padding: '0.5rem',
                        minWidth: '150px',
                        zIndex: 1001
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div 
                        style={{ 
                          padding: '0.5rem', 
                          cursor: 'pointer', 
                          borderRadius: '4px',
                          backgroundColor: searchType === 'all' ? '#e0e7ff' : 'transparent'
                        }}
                        onClick={() => { setSearchType('all'); setShowFilterDropdown(false); }}
                      >
                        All
                      </div>
                      <div 
                        style={{ 
                          padding: '0.5rem', 
                          cursor: 'pointer', 
                          borderRadius: '4px',
                          backgroundColor: searchType === 'posts' ? '#e0e7ff' : 'transparent'
                        }}
                        onClick={() => { setSearchType('posts'); setShowFilterDropdown(false); }}
                      >
                        Posts
                      </div>
                      <div 
                        style={{ 
                          padding: '0.5rem', 
                          cursor: 'pointer', 
                          borderRadius: '4px',
                          backgroundColor: searchType === 'users' ? '#e0e7ff' : 'transparent'
                        }}
                        onClick={() => { setSearchType('users'); setShowFilterDropdown(false); }}
                      >
                        Users
                      </div>
                      <div 
                        style={{ 
                          padding: '0.5rem', 
                          cursor: 'pointer', 
                          borderRadius: '4px',
                          backgroundColor: searchType === 'categories' ? '#e0e7ff' : 'transparent'
                        }}
                        onClick={() => { setSearchType('categories'); setShowFilterDropdown(false); }}
                      >
                        Categories
                      </div>
                    </div>
                  )}
                </button>
              </>
            ) : (
              <>
                <input
                  type="text"
                  placeholder={`Search ${searchType === 'all' ? 'everything' : searchType}...`}
                  className="nav-search-input"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  autoFocus
                />
                <button 
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className="nav-search-button"
                  title="Filter"
                  style={{ position: 'relative' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                  </svg>
                  {showFilterDropdown && (
                    <div 
                      className="filter-dropdown"
                      style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: '0.5rem',
                        background: 'white',
                        borderRadius: '6px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        padding: '0.5rem',
                        minWidth: '150px',
                        zIndex: 1001,
                        color: '#1e293b'
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div 
                        style={{ 
                          padding: '0.5rem', 
                          cursor: 'pointer', 
                          borderRadius: '4px',
                          backgroundColor: searchType === 'all' ? '#e0e7ff' : 'transparent'
                        }}
                        onClick={() => { setSearchType('all'); setShowFilterDropdown(false); }}
                      >
                        All
                      </div>
                      <div 
                        style={{ 
                          padding: '0.5rem', 
                          cursor: 'pointer', 
                          borderRadius: '4px',
                          backgroundColor: searchType === 'posts' ? '#e0e7ff' : 'transparent'
                        }}
                        onClick={() => { setSearchType('posts'); setShowFilterDropdown(false); }}
                      >
                        Posts
                      </div>
                      <div 
                        style={{ 
                          padding: '0.5rem', 
                          cursor: 'pointer', 
                          borderRadius: '4px',
                          backgroundColor: searchType === 'users' ? '#e0e7ff' : 'transparent'
                        }}
                        onClick={() => { setSearchType('users'); setShowFilterDropdown(false); }}
                      >
                        Users
                      </div>
                      <div 
                        style={{ 
                          padding: '0.5rem', 
                          cursor: 'pointer', 
                          borderRadius: '4px',
                          backgroundColor: searchType === 'categories' ? '#e0e7ff' : 'transparent'
                        }}
                        onClick={() => { setSearchType('categories'); setShowFilterDropdown(false); }}
                      >
                        Categories
                      </div>
                    </div>
                  )}
                </button>
                <button 
                  onClick={handleSearch} 
                  className="nav-search-button"
                  disabled={searching}
                  title="Search"
                >
                  {searching ? '...' : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.35-4.35"></path>
                    </svg>
                  )}
                </button>
                <button 
                  onClick={handleClearSearch} 
                  className="nav-search-clear"
                  title="Close search"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
        <div className="nav-menu">
          <div className="nav-categories">
            {categories
              .filter(cat => ['Books', 'Movies', 'Tech', 'Dharma', 'Gaming'].includes(cat.name))
              .sort((a, b) => {
                const order = ['Books', 'Movies', 'Tech', 'Dharma', 'Gaming'];
                return order.indexOf(a.name) - order.indexOf(b.name);
              })
              .map((category) => {
                const subCategories = subCategoriesMap[category.id] || [];
                const hasSubCategories = subCategories.length > 0;
                
                return (
                  <div
                    key={category.id}
                    className="nav-category-wrapper"
                    onMouseEnter={() => hasSubCategories && setHoveredCategory(category.id)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    <Link 
                      to={`/?category=${category.name}`}
                      className="nav-category-link"
                    >
                      {category.name}
                    </Link>
                    {hasSubCategories && hoveredCategory === category.id && (
                      <div className="nav-subcategory-dropdown">
                        {subCategories.map((subCategory) => (
                          <Link
                            key={subCategory.id}
                            to={`/?category=${category.name}&subcategory=${subCategory.name}`}
                            className="nav-subcategory-link"
                            onClick={() => setHoveredCategory(null)}
                          >
                            {subCategory.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
          {/* Hits Counter - moved to better location */}
          <div className="nav-hits">
            <span className="nav-hits-icon">👁</span>
            <span className="nav-hits-text">{totalViews.toLocaleString()}</span>
          </div>
          {user ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
              <button 
                onClick={handleLogout}
                className="nav-link"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Logout
              </button>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.8)' }}>{user.username}</span>
            </div>
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
          <Route 
            path="/posts/:id/edit" 
            element={
              <ProtectedRoute>
                <PostForm />
              </ProtectedRoute>
            } 
          />
          <Route path="/categories" element={<CategoryList />} />
          <Route 
            path="/subcategories" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <SubCategoryList />
              </ProtectedRoute>
            } 
          />
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
          <Route 
            path="/profile/setup" 
            element={
              <ProtectedRoute>
                <ProfileSetup />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/settings" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminSettings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/ads" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminAds />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/postmarks" 
            element={
              <ProtectedRoute>
                <PostmarksPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/review-posts" 
            element={
              <ProtectedRoute requireEditorOrAdmin={true}>
                <PostReviewPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/statistics" 
            element={
              <ProtectedRoute>
                <PostStatistics />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/statistics/:id" 
            element={
              <ProtectedRoute>
                <PostStatistics />
              </ProtectedRoute>
            } 
          />
          <Route path="/write-for-lladlad" element={<WriteForLladlad />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <SidebarProvider>
          <AppContent />
        </SidebarProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

