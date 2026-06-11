import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { getUserBookmarks } from '../services/api';
import Sidebar from './Sidebar';
import { uploadUrl } from '../config';
import '../App.css';

function PostmarksPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { sidebarOpen, closeSidebar } = useSidebar();
  const [bookmarks, setBookmarks] = useState([]);
  const [filteredBookmarks, setFilteredBookmarks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadBookmarks();
  }, [user, navigate]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredBookmarks(bookmarks);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = bookmarks.filter(bookmark => 
        bookmark.postTitle.toLowerCase().includes(query) ||
        (bookmark.postCategoryName && bookmark.postCategoryName.toLowerCase().includes(query))
      );
      setFilteredBookmarks(filtered);
    }
  }, [searchQuery, bookmarks]);

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      const response = await getUserBookmarks();
      setBookmarks(response.data || []);
      setFilteredBookmarks(response.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load postmarks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <>
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={closeSidebar}
        />
      )}
      <div className="magazine-layout">
        <div className={`sidebar-wrapper ${sidebarOpen ? 'open' : ''}`}>
          <Sidebar onClose={closeSidebar} />
        </div>
        <div className={`magazine-main ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <div style={{ maxWidth: '1200px', margin: '0.5rem auto', padding: '0 1rem' }}>
            <Link to="/" className="btn btn-back" style={{ marginBottom: '1rem' }}>
              ← Back to Home
            </Link>
            
            <div className="card">
              <h1>My Postmarks</h1>
              <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
                All your saved postmarks in one place ({bookmarks.length} total)
              </p>

              {/* Search Bar */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Search postmarks by title or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 2.5rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '1rem',
                      background: 'white'
                    }}
                  />
                  <svg 
                    width="20" 
                    height="20" 
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
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#94a3b8',
                        padding: '0.25rem'
                      }}
                      title="Clear search"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {error && <div className="error">{error}</div>}

              {loading ? (
                <div className="loading">Loading postmarks...</div>
              ) : filteredBookmarks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                  <svg 
                    width="64" 
                    height="64" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="1.5"
                    style={{ color: '#cbd5e1', marginBottom: '1rem' }}
                  >
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                  </svg>
                  <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
                    {searchQuery ? 'No postmarks found matching your search' : 'No postmarks yet'}
                  </p>
                  {!searchQuery && (
                    <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
                      Browse Posts
                    </Link>
                  )}
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  {filteredBookmarks.map((bookmark) => (
                    <Link
                      key={bookmark.id}
                      to={`/posts/${bookmark.postId}`}
                      className="card"
                      style={{
                        textDecoration: 'none',
                        display: 'block',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '';
                      }}
                    >
                      {bookmark.postImagePath && (
                        <div style={{ marginBottom: '1rem' }}>
                          <img 
                            src={uploadUrl(bookmark.postImagePath)}
                            alt={bookmark.postTitle}
                            style={{
                              width: '100%',
                              height: '200px',
                              objectFit: 'cover',
                              borderRadius: '6px'
                            }}
                          />
                        </div>
                      )}
                      <h3 style={{ marginBottom: '0.5rem', color: '#1e293b' }}>
                        {bookmark.postTitle}
                      </h3>
                      {bookmark.postCategoryName && (
                        <div style={{ 
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          background: '#1e3a8a',
                          color: 'white',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          marginBottom: '0.5rem'
                        }}>
                          {bookmark.postCategoryName}
                        </div>
                      )}
                      <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        Saved {new Date(bookmark.createdAt).toLocaleDateString()}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PostmarksPage;

