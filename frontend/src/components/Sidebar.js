import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllSettings, updateSetting, getUserBookmarks, subscribeToNewsletter } from '../services/api';
import { FacebookIcon, InstagramIcon, TwitterIcon } from './SocialIcons';
import AdPlacement from './AdPlacement';
import '../App.css';

function Sidebar({ onClose }) {
  const { user, isEditor, isAdmin, loadCurrentUser } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);
  const [showPostmarksSidebar, setShowPostmarksSidebar] = useState(false);
  const [postmarksSearchQuery, setPostmarksSearchQuery] = useState('');
  const [settings, setSettings] = useState({});
  const [socialOrder, setSocialOrder] = useState(['facebook', 'instagram', 'twitter', 'email']);
  const [socialEditMode, setSocialEditMode] = useState(false);
  const [socialDragKey, setSocialDragKey] = useState(null);
  const [newsletterNotice, setNewsletterNotice] = useState(null);
  const [subscribing, setSubscribing] = useState(false);
  const socialEditorRef = useRef(null);

  useEffect(() => {
    loadSettings();
    if (user) {
      loadBookmarks();
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      const response = await getAllSettings();
      const settingsData = response.data || {};
      setSettings(settingsData);
      if (settingsData.social_order) {
        const parsed = String(settingsData.social_order)
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);
        if (parsed.length > 0) setSocialOrder(parsed);
      }
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

  const canEditSocial = isAdmin() || isEditor();

  const socialItems = useMemo(() => {
    const hrefFor = {
      facebook: settings.social_facebook || 'https://facebook.com/lladlad',
      instagram: settings.social_instagram || 'https://instagram.com/lladlad',
      twitter: settings.social_twitter || 'https://twitter.com/lladlad',
      email: `mailto:${settings.contact_email || 'contact@lladlad.com'}`
    };
    const labelFor = {
      facebook: 'Facebook',
      instagram: 'Instagram',
      twitter: 'Twitter',
      email: 'Email'
    };
    const iconFor = {
      facebook: <FacebookIcon size={18} />,
      instagram: <InstagramIcon size={18} />,
      twitter: <TwitterIcon size={18} />,
      email: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
          <polyline points="22,6 12,13 2,6"></polyline>
        </svg>
      )
    };
    return socialOrder
      .map((k) => ({ key: k, href: hrefFor[k], icon: iconFor[k], label: labelFor[k] || k }))
      .filter((x) => x.href && x.icon);
  }, [settings, socialOrder]);

  const persistSocialOrder = async (order) => {
    try {
      await updateSetting('social_order', order.join(','), 'Order of social icons (comma-separated keys)');
      setSettings(prev => ({ ...prev, social_order: order.join(',') }));
    } catch (err) {
      console.error('Failed to update social order:', err);
    }
  };

  const reorderSocial = async (fromKey, toKey) => {
    if (!fromKey || !toKey || fromKey === toKey) return;
    const current = [...socialOrder];
    const fromIdx = current.indexOf(fromKey);
    const toIdx = current.indexOf(toKey);
    if (fromIdx === -1 || toIdx === -1) return;
    current.splice(fromIdx, 1);
    current.splice(toIdx, 0, fromKey);
    setSocialOrder(current);
    await persistSocialOrder(current);
  };

  useEffect(() => {
    if (!socialEditMode) return;
    const onDocMouseDown = (e) => {
      if (socialEditorRef.current && !socialEditorRef.current.contains(e.target)) {
        setSocialEditMode(false);
        setSocialDragKey(null);
      }
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [socialEditMode]);

  return (
    <aside className="sidebar">
      {/* Newsletter subscribe CTA (shown until user subscribes) */}
      {user && !user.newsletterSubscribed && (
        <div className="sidebar-card">
          <h3 style={{ marginTop: 0 }}>Newsletter</h3>
          <p style={{ marginTop: '0.35rem', color: '#64748b', fontSize: '0.9rem' }}>
            Subscribe to get updates when new posts and products are added.
          </p>
          {newsletterNotice && (
            <div
              style={{
                marginTop: '0.5rem',
                padding: '0.6rem 0.75rem',
                borderRadius: 10,
                border: '1px solid rgba(0,0,0,0.08)',
                background: newsletterNotice.type === 'error' ? '#fef2f2' : '#ecfdf5',
                color: '#0f172a',
                fontSize: '0.9rem'
              }}
            >
              {newsletterNotice.message}
            </div>
          )}
          <button
            type="button"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.6rem' }}
            disabled={subscribing}
            onClick={async () => {
              try {
                setNewsletterNotice(null);
                setSubscribing(true);
                await subscribeToNewsletter();
                await loadCurrentUser();
                setNewsletterNotice({ type: 'success', message: 'Subscribed successfully!' });
              } catch (e) {
                console.error(e);
                setNewsletterNotice({ type: 'error', message: 'Failed to subscribe. Please try again.' });
              } finally {
                setSubscribing(false);
              }
            }}
          >
            {subscribing ? 'Subscribing...' : 'Subscribe to Newsletter'}
          </button>
        </div>
      )}

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

      {/* Social icons should live ONLY in the side navbar */}
      <div className="sidebar-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
          <h3 style={{ margin: 0 }}>Follow us</h3>
          {canEditSocial && (
            <button
              type="button"
              className="sidebar-social-edit-btn"
              title={socialEditMode ? 'Close reorder' : 'Reorder social icons'}
              onClick={() => setSocialEditMode(v => !v)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
              </svg>
            </button>
          )}
        </div>

        <div className="sidebar-social-icons">
          {socialItems.map((item) => (
            <a
              key={item.key}
              href={item.href}
              target={item.key === 'email' ? undefined : '_blank'}
              rel={item.key === 'email' ? undefined : 'noopener noreferrer'}
              className="sidebar-social-icon"
              aria-label={item.key}
            >
              <span className="sidebar-social-icon-left">{item.icon}</span>
              <span className="sidebar-social-icon-label">{item.label}</span>
            </a>
          ))}
        </div>

        {canEditSocial && socialEditMode && (
          <div
            ref={socialEditorRef}
            className="sidebar-social-reorder-panel"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="sidebar-social-reorder-title">Reorder icons</div>
            {socialItems.map((item) => (
              <div
                key={item.key}
                className="sidebar-social-reorder-row"
                draggable
                onDragStart={() => setSocialDragKey(item.key)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  reorderSocial(socialDragKey, item.key);
                  setSocialDragKey(null);
                }}
                title="Drag to move"
              >
                <span className="sidebar-social-reorder-handle">⋮⋮</span>
                <span className="sidebar-social-reorder-icon">{item.icon}</span>
                <span className="sidebar-social-reorder-key">{item.key}</span>
              </div>
            ))}
            <button
              type="button"
              className="sidebar-social-reorder-done"
              onClick={() => setSocialEditMode(false)}
            >
              Done
            </button>
          </div>
        )}
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



