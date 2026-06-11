import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { getPostsForReview, approvePost, rejectPost } from '../services/api';
import Sidebar from './Sidebar';
import { uploadUrl } from '../config';
import '../App.css';

function PostReviewPage() {
  const { user, isEditor } = useAuth();
  const navigate = useNavigate();
  const { sidebarOpen, closeSidebar } = useSidebar();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [statusFilter, setStatusFilter] = useState('PENDING_REVIEW'); // PENDING_REVIEW, REJECTED, PUBLISHED
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingPost, setProcessingPost] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!isEditor()) {
      navigate('/');
      return;
    }
    loadPosts();
  }, [user, navigate, isEditor]);

  useEffect(() => {
    filterPosts();
  }, [statusFilter, searchQuery, posts]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await getPostsForReview();
      // Get all posts with different statuses for filtering
      const allPosts = response.data || [];
      setPosts(allPosts);
      setError(null);
    } catch (err) {
      setError('Failed to load posts for review');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterPosts = () => {
    let filtered = [...posts];

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(post => post.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post =>
        post.title?.toLowerCase().includes(query) ||
        post.authorUsername?.toLowerCase().includes(query) ||
        post.categoryName?.toLowerCase().includes(query) ||
        post.content?.toLowerCase().includes(query)
      );
    }

    // Sort by createdAt (newest first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA;
    });

    setFilteredPosts(filtered);
  };

  const handleApprove = async (postId) => {
    try {
      setProcessingPost(postId);
      await approvePost(postId);
      // Reload posts after approval
      await loadPosts();
    } catch (err) {
      alert('Failed to approve post: ' + (err.response?.data || err.message));
      console.error(err);
    } finally {
      setProcessingPost(null);
    }
  };

  const handleReject = async (postId) => {
    if (!window.confirm('Are you sure you want to reject this post? This action cannot be undone.')) {
      return;
    }
    try {
      setProcessingPost(postId);
      await rejectPost(postId);
      // Reload posts after rejection
      await loadPosts();
    } catch (err) {
      alert('Failed to reject post: ' + (err.response?.data || err.message));
      console.error(err);
    } finally {
      setProcessingPost(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING_REVIEW: { label: 'Pending Review', color: '#f59e0b', bg: '#fef3c7' },
      PUBLISHED: { label: 'Published', color: '#10b981', bg: '#d1fae5' },
      REJECTED: { label: 'Rejected', color: '#ef4444', bg: '#fee2e2' },
      DRAFT: { label: 'Draft', color: '#6b7280', bg: '#f3f4f6' }
    };
    const config = statusConfig[status] || statusConfig.PENDING_REVIEW;
    return (
      <span
        style={{
          display: 'inline-block',
          padding: '0.25rem 0.75rem',
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: '600',
          color: config.color,
          backgroundColor: config.bg
        }}
      >
        {config.label}
      </span>
    );
  };

  const stripHtml = (html) => {
    if (!html) return '';
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  if (!user || !isEditor()) {
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
              <h1>Post Review</h1>
              <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
                Review and approve posts submitted by users ({posts.length} pending)
              </p>

              {/* Filters */}
              <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {/* Status Filter */}
                <div style={{ flex: '1', minWidth: '200px' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#1e293b' }}>
                    Status Filter
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '1rem',
                      background: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="PENDING_REVIEW">Pending Review</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="ALL">All Statuses</option>
                  </select>
                </div>

                {/* Search Bar */}
                <div style={{ flex: '2', minWidth: '250px' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#1e293b' }}>
                    Search
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="Search by title, author, category, or content..."
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
              </div>

              {error && <div className="error">{error}</div>}

              {loading ? (
                <div className="loading">Loading posts for review...</div>
              ) : filteredPosts.length === 0 ? (
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
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
                    {searchQuery || statusFilter !== 'PENDING_REVIEW' 
                      ? 'No posts found matching your filters' 
                      : 'No posts pending review'}
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {filteredPosts.map((post) => (
                    <div
                      key={post.id}
                      className="card"
                      style={{
                        border: post.status === 'PENDING_REVIEW' ? '2px solid #f59e0b' : '1px solid #e2e8f0',
                        transition: 'box-shadow 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                        {/* Post Image/Thumbnail */}
                        {(post.imagePath || post.youtubeUrl) && (
                          <div style={{ flex: '0 0 200px', minWidth: '200px' }}>
                            {post.imagePath ? (
                              <img 
                                src={uploadUrl(post.imagePath)}
                                alt={post.title}
                                style={{
                                  width: '100%',
                                  height: '150px',
                                  objectFit: 'cover',
                                  borderRadius: '6px'
                                }}
                              />
                            ) : post.youtubeUrl ? (
                              <img 
                                src={`https://img.youtube.com/vi/${post.youtubeVideoId || ''}/maxresdefault.jpg`}
                                alt={post.title}
                                style={{
                                  width: '100%',
                                  height: '150px',
                                  objectFit: 'cover',
                                  borderRadius: '6px'
                                }}
                              />
                            ) : null}
                          </div>
                        )}

                        {/* Post Content */}
                        <div style={{ flex: '1', minWidth: '300px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', gap: '1rem' }}>
                            <div style={{ flex: '1' }}>
                              <h2 style={{ margin: '0 0 0.5rem 0', color: '#1e293b', fontSize: '1.5rem' }}>
                                <Link 
                                  to={`/posts/${post.id}`}
                                  style={{ color: 'inherit', textDecoration: 'none' }}
                                  target="_blank"
                                >
                                  {post.title || 'Untitled Post'}
                                </Link>
                              </h2>
                              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.5rem' }}>
                                {getStatusBadge(post.status)}
                                {post.categoryName && (
                                  <span style={{
                                    display: 'inline-block',
                                    padding: '0.25rem 0.75rem',
                                    background: '#1e3a8a',
                                    color: 'white',
                                    borderRadius: '12px',
                                    fontSize: '0.75rem',
                                    fontWeight: '500'
                                  }}>
                                    {post.categoryName}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Post Meta */}
                          <div style={{ marginBottom: '0.75rem', fontSize: '0.875rem', color: '#64748b' }}>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                              <span>
                                <strong>Author:</strong> {post.authorUsername || 'Unknown'}
                              </span>
                              <span>
                                <strong>Created:</strong> {new Date(post.createdAt).toLocaleString()}
                              </span>
                              {post.updatedAt && post.updatedAt !== post.createdAt && (
                                <span>
                                  <strong>Updated:</strong> {new Date(post.updatedAt).toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Content Preview */}
                          {post.content && (
                            <div style={{ 
                              marginBottom: '1rem',
                              color: '#475569',
                              fontSize: '0.9rem',
                              lineHeight: '1.6',
                              maxHeight: '100px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {stripHtml(post.content).substring(0, 200)}
                              {stripHtml(post.content).length > 200 && '...'}
                            </div>
                          )}

                          {/* Action Buttons */}
                          {post.status === 'PENDING_REVIEW' && (
                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                              <button
                                onClick={() => handleApprove(post.id)}
                                disabled={processingPost === post.id}
                                className="btn btn-primary"
                                style={{
                                  backgroundColor: '#10b981',
                                  borderColor: '#10b981',
                                  opacity: processingPost === post.id ? 0.6 : 1,
                                  cursor: processingPost === post.id ? 'not-allowed' : 'pointer'
                                }}
                              >
                                {processingPost === post.id ? 'Processing...' : '✓ Approve'}
                              </button>
                              <button
                                onClick={() => handleReject(post.id)}
                                disabled={processingPost === post.id}
                                className="btn"
                                style={{
                                  backgroundColor: '#ef4444',
                                  borderColor: '#ef4444',
                                  color: 'white',
                                  opacity: processingPost === post.id ? 0.6 : 1,
                                  cursor: processingPost === post.id ? 'not-allowed' : 'pointer'
                                }}
                              >
                                {processingPost === post.id ? 'Processing...' : '✗ Reject'}
                              </button>
                              <Link
                                to={`/posts/${post.id}`}
                                target="_blank"
                                className="btn"
                                style={{
                                  backgroundColor: '#3b82f6',
                                  borderColor: '#3b82f6',
                                  color: 'white',
                                  textDecoration: 'none'
                                }}
                              >
                                View Post
                              </Link>
                            </div>
                          )}

                          {post.status === 'REJECTED' && (
                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                              <button
                                onClick={() => handleApprove(post.id)}
                                disabled={processingPost === post.id}
                                className="btn btn-primary"
                                style={{
                                  backgroundColor: '#10b981',
                                  borderColor: '#10b981',
                                  opacity: processingPost === post.id ? 0.6 : 1,
                                  cursor: processingPost === post.id ? 'not-allowed' : 'pointer'
                                }}
                              >
                                {processingPost === post.id ? 'Processing...' : '✓ Approve'}
                              </button>
                              <Link
                                to={`/posts/${post.id}`}
                                target="_blank"
                                className="btn"
                                style={{
                                  backgroundColor: '#3b82f6',
                                  borderColor: '#3b82f6',
                                  color: 'white',
                                  textDecoration: 'none'
                                }}
                              >
                                View Post
                              </Link>
                            </div>
                          )}

                          {post.status === 'PUBLISHED' && (
                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                              <Link
                                to={`/posts/${post.id}`}
                                target="_blank"
                                className="btn btn-primary"
                                style={{
                                  textDecoration: 'none'
                                }}
                              >
                                View Published Post
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
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

export default PostReviewPage;

