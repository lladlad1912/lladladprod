import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllSettings, getUserBookmarks } from '../services/api';
import { FacebookIcon, InstagramIcon, TwitterIcon, YouTubeIcon } from './SocialIcons';
import AdPlacement from './AdPlacement';
import '../App.css';

function Sidebar({ onClose }) {
  const { user, isEditor, isAdmin } = useAuth();
  const [settings, setSettings] = useState({});
  const [bookmarks, setBookmarks] = useState([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);
  const [showPostmarksSidebar, setShowPostmarksSidebar] = useState(false);
  const [postmarksSearchQuery, setPostmarksSearchQuery] = useState('');

  useEffect(() => {
    loadSettings();
    if (user) {
      loadBookmarks();
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      const response = await getAllSettings();
      setSettings(response.data);
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  const loadBookmarks = async () => {
    try {
      setLoadingBookmarks(true);
      const response = await getUserBookmarks();
      setBookmarks(response.data || []);
    } catch (err) {
      console.error('Failed to load bookmarks:', err);
    } finally {
      setLoadingBookmarks(false);
    }
  };

  return (
    <aside className="sidebar">
      {/* Bookmarks Section - for all users */}
      <div className="sidebar-card">
        {!user ? (
          <>
            <h3>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', marginRight: '0.5rem', verticalAlign: 'middle' }}>
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
              Postmarks
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
              <Link to="/login" style={{ color: '#1e3a8a', textDecoration: 'underline' }}>Login</Link> to save postmarks
            </p>
          </>
        ) : (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '6px',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              onMouseDown={() => setShowPostmarksSidebar(true)}
              onMouseUp={() => setShowPostmarksSidebar(true)}
              onClick={() => setShowPostmarksSidebar(true)}
            >
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                </svg>
                Postmarks
              </h3>
              {loadingBookmarks ? (
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>...</span>
              ) : (
                <span style={{ 
                  fontSize: '0.85rem', 
                  color: '#1e3a8a',
                  background: '#e0e7ff',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '12px',
                  fontWeight: '500'
                }}>
                  {bookmarks.length}
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Nested Postmarks Sidebar */}
      {showPostmarksSidebar && user && (
        <>
          <div 
            className="sidebar-overlay-nested"
            onClick={() => setShowPostmarksSidebar(false)}
            style={{
              left: '300px',
              background: 'rgba(0, 0, 0, 0.3)',
              zIndex: 1003
            }}
          />
          <div className="sidebar-nested">
            <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                  </svg>
                  All Postmarks ({bookmarks.length})
                </h3>
                <button
                  onClick={() => setShowPostmarksSidebar(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    color: '#64748b'
                  }}
                  title="Close"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search postmarks..."
                  value={postmarksSearchQuery}
                  onChange={(e) => setPostmarksSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.5rem 0.5rem 2rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '0.9rem'
                  }}
                />
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8'
                  }}
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
              </div>
              <Link
                to="/postmarks"
                className="btn btn-primary"
                style={{ 
                  width: '100%', 
                  textAlign: 'center', 
                  display: 'block', 
                  marginTop: '0.75rem',
                  fontSize: '0.85rem',
                  padding: '0.5rem'
                }}
                onClick={() => {
                  setShowPostmarksSidebar(false);
                  onClose();
                }}
              >
                View All Postmarks
              </Link>
            </div>
            <div style={{ maxHeight: 'calc(100vh - 250px)', overflowY: 'auto', padding: '0.5rem' }}>
              {loadingBookmarks ? (
                <p style={{ fontSize: '0.9rem', color: '#666', textAlign: 'center', padding: '2rem' }}>Loading...</p>
              ) : (() => {
                const filtered = postmarksSearchQuery.trim() === '' 
                  ? bookmarks 
                  : bookmarks.filter(b => 
                      b.postTitle.toLowerCase().includes(postmarksSearchQuery.toLowerCase()) ||
                      (b.postCategoryName && b.postCategoryName.toLowerCase().includes(postmarksSearchQuery.toLowerCase()))
                    );
                
                return filtered.length === 0 ? (
                  <p style={{ fontSize: '0.9rem', color: '#666', textAlign: 'center', padding: '2rem' }}>
                    {postmarksSearchQuery ? 'No postmarks found' : 'No postmarks yet'}
                  </p>
                ) : (
                  filtered.map((bookmark) => (
                    <Link
                      key={bookmark.id}
                      to={`/posts/${bookmark.postId}`}
                      className="sidebar-bookmark-item"
                      style={{
                        display: 'block',
                        padding: '0.75rem',
                        marginBottom: '0.5rem',
                        background: '#f9fafb',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        color: '#1e293b',
                        transition: 'all 0.2s'
                      }}
                      onClick={() => {
                        setShowPostmarksSidebar(false);
                        onClose();
                      }}
                    >
                      <div style={{ fontWeight: '500', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                        {bookmark.postTitle}
                      </div>
                      {bookmark.postCategoryName && (
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {bookmark.postCategoryName}
                        </div>
                      )}
                    </Link>
                  ))
                );
              })()}
            </div>
          </div>
        </>
      )}

      {/* Social Media Links - for all users */}
      <div className="sidebar-card">
        <h3>Follow Us</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {settings.social_facebook && (
            <a
              href={settings.social_facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="sidebar-social-link"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem',
                background: '#f9fafb',
                borderRadius: '6px',
                textDecoration: 'none',
                color: '#1e293b',
                transition: 'all 0.2s'
              }}
            >
              <FacebookIcon size={20} />
              <span>Facebook</span>
            </a>
          )}
          {settings.social_instagram && (
            <a
              href={settings.social_instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="sidebar-social-link"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem',
                background: '#f9fafb',
                borderRadius: '6px',
                textDecoration: 'none',
                color: '#1e293b',
                transition: 'all 0.2s'
              }}
            >
              <InstagramIcon size={20} />
              <span>Instagram</span>
            </a>
          )}
          {settings.social_twitter && (
            <a
              href={settings.social_twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="sidebar-social-link"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem',
                background: '#f9fafb',
                borderRadius: '6px',
                textDecoration: 'none',
                color: '#1e293b',
                transition: 'all 0.2s'
              }}
            >
              <TwitterIcon size={20} />
              <span>Twitter</span>
            </a>
          )}
          {settings.social_youtube ? (
            <a
              href={settings.social_youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="sidebar-social-link"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem',
                background: '#f9fafb',
                borderRadius: '6px',
                textDecoration: 'none',
                color: '#1e293b',
                transition: 'all 0.2s'
              }}
            >
              <YouTubeIcon size={20} />
              <span>YouTube</span>
            </a>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem',
              background: '#f9fafb',
              borderRadius: '6px',
              color: '#94a3b8',
              fontSize: '0.9rem'
            }}>
              <YouTubeIcon size={20} />
              <span>YouTube (Not configured)</span>
            </div>
          )}
        </div>
      </div>
      {user && (
        <div className="sidebar-card">
          <h3>Profile</h3>
          <Link 
            to="/profile" 
            className="btn btn-primary" 
            style={{ width: '100%', textAlign: 'center', display: 'block', marginBottom: '0.5rem' }}
          >
            View Profile
          </Link>
          <Link 
            to="/posts/new" 
            className="btn btn-secondary" 
            style={{ width: '100%', textAlign: 'center', display: 'block', marginBottom: '0.5rem' }}
          >
            + Create New Post
          </Link>
          {user && (
            <Link 
              to="/statistics" 
              className="btn btn-secondary" 
              style={{ width: '100%', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
              My Statistics
            </Link>
          )}
          {isEditor() && (
            <>
              <Link 
                to="/review-posts" 
                className="btn btn-secondary" 
                style={{ width: '100%', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                Review Posts
              </Link>
              <Link 
                to="/statistics" 
                className="btn btn-secondary" 
                style={{ width: '100%', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
                Statistics
              </Link>
            </>
          )}
        </div>
      )}

      {isAdmin() && (
        <div className="sidebar-card">
          <h3>Admin</h3>
          <Link 
            to="/users" 
            className="btn btn-secondary" 
            style={{ width: '100%', textAlign: 'center', display: 'block', marginBottom: '0.5rem' }}
          >
            Users
          </Link>
          <Link 
            to="/categories" 
            className="btn btn-secondary" 
            style={{ width: '100%', textAlign: 'center', display: 'block', marginBottom: '0.5rem' }}
          >
            Categories
          </Link>
          <Link 
            to="/subcategories" 
            className="btn btn-secondary" 
            style={{ width: '100%', textAlign: 'center', display: 'block', marginBottom: '0.5rem' }}
          >
            SubCategories
          </Link>
          <Link 
            to="/admin/settings" 
            className="btn btn-secondary" 
            style={{ width: '100%', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            Settings
          </Link>
          <Link 
            to="/admin/ads" 
            className="btn btn-secondary" 
            style={{ width: '100%', textAlign: 'center', display: 'block', marginBottom: '0.5rem' }}
          >
            Ads
          </Link>
          <Link 
            to="/statistics" 
            className="btn btn-secondary" 
            style={{ width: '100%', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
            Statistics
          </Link>
        </div>
      )}

      <AdPlacement position="sidebar" />
    </aside>
  );
}

export default Sidebar;



