import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { getPost, deletePost, toggleLike, getLikeCount, incrementPostView, toggleBookmark, checkBookmark } from '../services/api';
import Sidebar from './Sidebar';
import YouTubeEmbed from './YouTubeEmbed';
import CommentSection from './CommentSection';
import SEO from './SEO';
import StructuredData from './StructuredData';
import '../App.css';

// CommentSection - no memoization to prevent typing issues

function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isEditor } = useAuth();
  const { sidebarOpen, closeSidebar } = useSidebar();
  const [post, setPost] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [readingProgress, setReadingProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPost();
    
    // Track view when post loads (only once)
    const trackView = async () => {
      try {
        await incrementPostView(id, user?.id || null);
        // Reload post to get updated view count
        const response = await getPost(id);
        if (response.data) {
          setViewCount(response.data.viewCount || 0);
        }
      } catch (err) {
        console.error('Failed to track view:', err);
      }
    };
    trackView();
    
    // Set up reading progress tracker
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollableHeight = documentHeight - windowHeight;
      const progress = scrollableHeight > 0 ? (scrollTop / scrollableHeight) * 100 : 0;
      setReadingProgress(Math.min(100, Math.max(0, progress)));
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [id, user]);

  const loadPost = async () => {
    try {
      setLoading(true);
      const url = user ? `/posts/${id}?userId=${user.id}` : `/posts/${id}`;
      const response = await getPost(id);
      setPost(response.data);
      setLikeCount(response.data.likeCount || 0);
      setLiked(response.data.liked || false);
      setViewCount(response.data.viewCount || 0);
      setError(null);
    } catch (err) {
      setError('Failed to load post');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const response = await toggleLike(id, user.id);
      setLiked(response.data.liked);
      // Reload like count
      const countRes = await getLikeCount(id);
      setLikeCount(countRes.data.count);
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      // Store the post ID to bookmark after login
      localStorage.setItem('pendingBookmark', id);
      navigate('/login');
      return;
    }
    try {
      const response = await toggleBookmark(id);
      setBookmarked(response.data.bookmarked);
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
      if (err.response?.status === 401) {
        localStorage.setItem('pendingBookmark', id);
        navigate('/login');
      }
    }
  };


  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(id);
        navigate('/');
      } catch (err) {
        setError('Failed to delete post');
        console.error(err);
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading post...</div>;
  }

  if (error || !post) {
    return (
      <div>
        <div className="error">{error || 'Post not found'}</div>
        <Link to="/" className="btn btn-secondary">Back to Posts</Link>
      </div>
    );
  }

  // Prepare SEO data
  const siteUrl = process.env.REACT_APP_SITE_URL || 'http://localhost:3000';
  const postImage = post.imagePath 
    ? `http://localhost:8080/uploads/${post.imagePath}` 
    : (post.youtubeUrl ? `https://img.youtube.com/vi/${post.youtubeVideoId || ''}/maxresdefault.jpg` : null);
  const postUrl = `${siteUrl}/posts/${post.id}`;
  const postDescription = post.metaDescription || post.content?.replace(/<[^>]*>/g, '').substring(0, 160) || 'Read this post on lladlad';
  const postKeywords = post.metaKeywords || post.hashtags || '';
  const tags = post.hashtags ? post.hashtags.split(',').map(t => t.trim()).filter(t => t) : [];

  return (
    <>
      <SEO
        title={post.metaTitle || post.title}
        description={postDescription}
        keywords={postKeywords}
        image={postImage}
        url={postUrl}
        type="article"
        author={post.authorUsername}
        publishedTime={post.createdAt}
        modifiedTime={post.updatedAt}
        articleSection={post.categoryName}
        tags={tags}
      />
      <StructuredData
        type="Article"
        data={{
          headline: post.title,
          description: postDescription,
          image: postImage,
          datePublished: post.createdAt,
          dateModified: post.updatedAt,
          author: {
            name: post.authorUsername,
            url: `${siteUrl}/users/${post.authorId}`
          },
          publisher: {
            name: 'lladlad',
            logo: {
              url: `${siteUrl}/logo192.png`
            }
          },
          mainEntityOfPage: {
            type: 'WebPage',
            id: postUrl
          },
          articleSection: post.categoryName,
          keywords: postKeywords
        }}
      />
      <StructuredData
        type="BreadcrumbList"
        data={{
          items: [
            { name: 'Home', url: siteUrl },
            { name: post.categoryName || 'Posts', url: `${siteUrl}/?category=${post.categoryName || ''}` },
            { name: post.title, url: postUrl }
          ]
        }}
      />
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
          <div>
            {/* Reading Progress Bar */}
            <div className="reading-progress-bar" style={{ width: `${readingProgress}%` }}></div>
            
            <Link to="/" className="btn btn-back" style={{ marginBottom: '0.5rem' }}>
              ← Back to Posts
            </Link>

            <div className="card" style={{ position: 'relative' }}>
              {/* Edit/Delete buttons at top right */}
              <div className="post-detail-header-actions">
                {isEditor() && user?.id === post.authorId && (
                  <Link 
                    to={`/posts/${id}/edit`}
                    className="magazine-edit-btn"
                    title="Edit post"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </Link>
                )}
                {isAdmin() && (
                  <button 
                    onClick={handleDelete} 
                    className="magazine-delete-btn"
                    title="Delete post (Admin only)"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                )}
              </div>
              
              <h1>{post.title}</h1>
              <div className="post-meta">
                By <strong>{post.authorUsername}</strong> in <strong>{post.categoryName}</strong> • 
                Created: {new Date(post.createdAt).toLocaleString()}
                {post.updatedAt && post.createdAt !== post.updatedAt && (
                  <> • Updated: {new Date(post.updatedAt).toLocaleString()}</>
                )}
              </div>
              
              <div className="post-stats">
                <span className="post-stat-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  <strong>{viewCount}</strong> views
                </span>
                <span className="post-stat-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                  </svg>
                  <strong>{Math.round(readingProgress)}%</strong> read
                </span>
              </div>

              {post.imagePath && (
                <div style={{ marginBottom: '1rem' }}>
                  <img 
                    src={`http://localhost:8080/uploads/${post.imagePath}`}
                    alt={post.metaDescription || post.title || 'Post image'}
                    title={post.title}
                    style={{ width: '100%', borderRadius: '8px', maxHeight: '400px', objectFit: 'cover' }}
                  />
                </div>
              )}

              {post.youtubeEmbedUrl && (
                <div style={{ maxWidth: '600px', margin: '0 auto 1rem' }}>
                  <YouTubeEmbed embedUrl={post.youtubeEmbedUrl} />
                </div>
              )}

              {post.content && (
                <div className="post-content" style={{ whiteSpace: 'pre-wrap' }}>
                  {post.content}
                </div>
              )}

              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={handleLike}
                  className={`btn ${liked ? 'btn-liked' : 'btn-like'}`}
                >
                  {liked ? '❤️ Liked' : '🤍 Like'} ({likeCount})
                </button>
                <button
                  onClick={handleBookmark}
                  className={`btn ${bookmarked ? 'btn-primary' : 'btn-secondary'}`}
                  title={bookmarked ? 'Remove from postmarks' : 'Add to postmarks'}
                >
                  {bookmarked ? '🔖 Postmarked' : '🔖 Postmark'}
                </button>
                <span style={{ color: '#475569' }}>
                  💬 {post.commentCount || 0} comments
                </span>
              </div>

              {/* Share Buttons */}
              <div className="post-share-section" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                <h4 style={{ marginBottom: '0.75rem', fontSize: '1rem', color: '#1e293b' }}>Share this post:</h4>
                <div className="share-buttons" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`${post.title} - ${window.location.href}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="share-btn-icon share-whatsapp"
                    title="Share on WhatsApp"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="share-btn-icon share-twitter"
                    title="Share on Twitter"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                    </svg>
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href).then(() => {
                        alert('Link copied! You can now paste it on Instagram.');
                      }).catch(() => {
                        // Fallback for older browsers
                        const textArea = document.createElement('textarea');
                        textArea.value = window.location.href;
                        document.body.appendChild(textArea);
                        textArea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textArea);
                        alert('Link copied! You can now paste it on Instagram.');
                      });
                    }}
                    className="share-btn-icon share-instagram"
                    title="Copy link for Instagram"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </button>
                  
                  {/* Shareable Link - inline with icons */}
                  <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="text"
                      value={window.location.href}
                      readOnly
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                        background: '#f9fafb',
                        color: '#1e293b'
                      }}
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href).then(() => {
                          alert('Link copied to clipboard!');
                        }).catch(() => {
                          // Fallback for older browsers
                          const textArea = document.createElement('textarea');
                          textArea.value = window.location.href;
                          document.body.appendChild(textArea);
                          textArea.select();
                          document.execCommand('copy');
                          document.body.removeChild(textArea);
                          alert('Link copied to clipboard!');
                        });
                      }}
                      className="btn btn-primary"
                      title="Copy link"
                      style={{ padding: '0.5rem 0.75rem', whiteSpace: 'nowrap' }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {post.youtubeUrl && (
                <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '6px' }}>
                  <strong>YouTube URL:</strong>{' '}
                  <a href={post.youtubeUrl} target="_blank" rel="noopener noreferrer">
                    {post.youtubeUrl}
                  </a>
                </div>
              )}

              {/* Comments Section - Using CommentSection component */}
              <CommentSection postId={id} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PostDetail;


