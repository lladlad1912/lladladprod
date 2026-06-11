import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { getPosts, deletePost, getCategories, getPostsByCategory, toggleLike, searchAll } from '../services/api';
import Sidebar from './Sidebar';
import AdPlacement from './AdPlacement';
import SEO from './SEO';
import StructuredData from './StructuredData';
import { SITE_URL, uploadUrl } from '../config';
import '../App.css';

function MagazinePostList() {
  const { user, isAdmin, isEditor } = useAuth();
  const { sidebarOpen, closeSidebar } = useSidebar();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const searchParam = searchParams.get('search');
  const searchTypeParam = searchParams.get('type') || 'all';
  const [posts, setPosts] = useState([]);
  const [displayPosts, setDisplayPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [imageDimensions, setImageDimensions] = useState({});

  // Helper function to extract YouTube video ID from URL
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    
    // If it's already just an ID (11 characters, alphanumeric)
    if (url.match(/^[a-zA-Z0-9_-]{11}$/)) {
      return url;
    }
    
    // Extract from various YouTube URL formats
    let videoId = null;
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.substring(url.indexOf('v=') + 2);
      if (videoId.includes('&')) {
        videoId = videoId.substring(0, videoId.indexOf('&'));
      }
    } else if (url.includes('youtu.be/')) {
      videoId = url.substring(url.indexOf('youtu.be/') + 9);
      if (videoId.includes('?')) {
        videoId = videoId.substring(0, videoId.indexOf('?'));
      }
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.substring(url.indexOf('embed/') + 6);
      if (videoId.includes('?')) {
        videoId = videoId.substring(0, videoId.indexOf('?'));
      }
    }
    
    return videoId;
  };

  // Generate YouTube thumbnail URL
  const getYouTubeThumbnail = (url) => {
    const videoId = getYouTubeVideoId(url);
    if (!videoId) return null;
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (searchParam) {
      loadSearchResults(searchParam, searchTypeParam);
    } else if (categoryParam && categories.length > 0) {
      loadPostsByCategory(categoryParam);
    } else if (!categoryParam) {
      loadPosts();
    }
  }, [categoryParam, categories, searchParam, searchTypeParam]);

  const loadCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await getPosts();
      const allPosts = response.data.content || response.data;
      // Sort posts by createdAt in descending order (newest first)
      const sortedPosts = [...allPosts].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA; // Descending order
      });
      setPosts(sortedPosts);
      setDisplayPosts(sortedPosts);
      setError(null);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 429) {
        setError('Too many requests. Please wait a moment and refresh.');
      } else {
        setError('Failed to load posts. Make sure the backend is running.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadPostsByCategory = async (categoryName) => {
    try {
      setLoading(true);
      // Find category by name (case-insensitive)
      const category = categories.find(cat => 
        cat.name.toLowerCase() === categoryName.toLowerCase()
      );
      if (category) {
        const response = await getPostsByCategory(category.id);
        const categoryPosts = response.data.content || response.data;
        // Sort posts by createdAt in descending order (newest first)
        const sortedPosts = [...categoryPosts].sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB - dateA; // Descending order
        });
        setPosts(sortedPosts);
        setDisplayPosts(sortedPosts);
      } else {
        // If category not found yet, wait for categories to load or load all posts
        if (categories.length === 0) {
          // Categories not loaded yet, will retry when categories load
          return;
        }
        loadPosts();
      }
      setError(null);
    } catch (err) {
      setError('Failed to load posts by category.');
      console.error(err);
      loadPosts(); // Fallback to all posts
    } finally {
      setLoading(false);
    }
  };

  const loadSearchResults = async (keyword, type) => {
    try {
      setLoading(true);
      const response = await searchAll(keyword, type, 0, 50);
      const results = response.data;
      
      // Handle different search types
      if (type === 'all' || type === 'posts') {
        const postResults = results.posts || [];
        const sortedResults = [...postResults].sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB - dateA;
        });
        setDisplayPosts(sortedResults);
      } else {
        // For users/categories search, show empty or handle differently
        setDisplayPosts([]);
      }
      setError(null);
    } catch (err) {
      setError('Failed to load search results');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchResults = (results) => {
    if (results && results.length > 0) {
      // Sort search results by date
      const sortedResults = [...results].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA; // Descending order
      });
      setDisplayPosts(sortedResults);
    } else if (results === null) {
      // Clear search - show posts based on current category filter
      if (categoryParam && categories.length > 0) {
        loadPostsByCategory(categoryParam);
      } else {
        loadPosts();
      }
    } else {
      // Empty results - show empty state
      setDisplayPosts([]);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(id);
        loadPosts();
      } catch (err) {
        setError('Failed to delete post');
        console.error(err);
      }
    }
  };

  const handleLike = async (postId) => {
    if (!user) {
      alert('Please login to like posts');
      return;
    }
    try {
      await toggleLike(postId, user.id);
      // Toggle liked state
      setLikedPosts(prev => {
        const newSet = new Set(prev);
        if (newSet.has(postId)) {
          newSet.delete(postId);
        } else {
          newSet.add(postId);
        }
        return newSet;
      });
      // Reload posts to get updated like count
      if (categoryParam && categories.length > 0) {
        loadPostsByCategory(categoryParam);
      } else {
        loadPosts();
      }
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  if (loading) {
    return <div className="loading">Loading posts...</div>;
  }

  const siteUrl = SITE_URL;
  const categoryName = categoryParam ? categories.find(c => c.name === categoryParam)?.name : null;
  const pageTitle = categoryName ? `${categoryName} Posts | lladlad` : 'lladlad - Blog Posts';
  const pageDescription = categoryName 
    ? `Browse ${categoryName} posts on lladlad. Read articles, watch videos, and discover content.`
    : 'Discover articles, videos, and blog posts on lladlad. Explore categories like Movies, Tech, Dharma, Gaming, and Books.';

  return (
    <>
      <SEO
        title={pageTitle}
        description={pageDescription}
        keywords={categoryName ? `${categoryName}, blog, articles, posts` : 'blog, articles, posts, videos, telugu content'}
        url={`${siteUrl}${categoryParam ? `/?category=${categoryParam}` : '/'}`}
      />
      <StructuredData
        type="WebSite"
        data={{
          name: 'lladlad',
          url: siteUrl,
          description: 'Blog Application with YouTube Integration',
          searchAction: {
            urlTemplate: `${siteUrl}/?search={search_term_string}`
          }
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
          {error && <div className="error">{error}</div>}

          {displayPosts.length === 0 ? (
            <div className="card">
              <p>No posts found. {user && <Link to="/posts/new">Create your first post!</Link>}</p>
            </div>
          ) : (
            <div className="magazine-grid">
              {displayPosts.map((post, index) => {
                // Dynamic sizing based on image dimensions (portrait vs landscape)
                // Check for both uploaded image and YouTube thumbnail
                const hasImage = post.imagePath || getYouTubeThumbnail(post.youtubeUrl);
                let sizeClass = 'size-standard';
                
                if (hasImage) {
                  const imgDim = imageDimensions[post.id];
                  if (imgDim) {
                    // Determine if image is portrait (height > width) or landscape
                    const aspectRatio = imgDim.width / imgDim.height;
                    if (aspectRatio < 0.8) {
                      // Portrait image - taller cards
                      sizeClass = `size-portrait-${(index % 2) + 1}`;
                    } else if (aspectRatio > 1.3) {
                      // Wide landscape image - wider cards
                      sizeClass = `size-landscape-${(index % 2) + 1}`;
                    } else {
                      // Square or near-square - standard sizes
                      sizeClass = `size-square-${(index % 3) + 1}`;
                    }
                  } else {
                    // Fallback to index-based sizing while image loads
                    sizeClass = `size-${(index % 4) + 1}`;
                  }
                }
                
                return (
                  <article 
                    key={post.id} 
                    className={`magazine-card ${sizeClass}`}
                  >
                    {/* Edit/Delete buttons at top right */}
                    <div className="magazine-card-header-actions">
                      {(isAdmin() || (user?.id === post.authorId && (isEditor() || user?.role === 'USER'))) && (
                        <Link 
                          to={`/posts/${post.id}/edit`}
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
                          onClick={() => handleDelete(post.id)} 
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
                    
                    <div className="magazine-card-image">
                      <Link to={`/posts/${post.id}`}>
                        {post.imagePath ? (
                          <img 
                            src={uploadUrl(post.imagePath)}
                            alt={post.metaDescription || post.title || 'Post image'}
                            title={post.title}
                            onLoad={(e) => {
                              // Store image dimensions for dynamic sizing
                              const img = e.target;
                              setImageDimensions(prev => ({
                                ...prev,
                                [post.id]: {
                                  width: img.naturalWidth,
                                  height: img.naturalHeight
                                }
                              }));
                            }}
                            onError={(e) => {
                              // Hide broken image and show placeholder or YouTube thumbnail
                              e.target.style.display = 'none';
                              const placeholder = e.target.nextSibling;
                              if (placeholder) {
                                placeholder.style.display = 'flex';
                              }
                            }}
                          />
                        ) : getYouTubeThumbnail(post.youtubeUrl) ? (
                          <div className="magazine-card-youtube-thumbnail">
                            <img 
                              src={getYouTubeThumbnail(post.youtubeUrl)}
                              alt={post.metaDescription || post.title || 'YouTube video thumbnail'}
                              title={post.title}
                              onLoad={(e) => {
                                // Store image dimensions for dynamic sizing
                                const img = e.target;
                                setImageDimensions(prev => ({
                                  ...prev,
                                  [post.id]: {
                                    width: img.naturalWidth,
                                    height: img.naturalHeight
                                  }
                                }));
                              }}
                              onError={(e) => {
                                // Fallback to placeholder if YouTube thumbnail fails
                                e.target.style.display = 'none';
                                const placeholder = e.target.parentElement.nextSibling;
                                if (placeholder) {
                                  placeholder.style.display = 'flex';
                                }
                              }}
                            />
                            <div className="youtube-play-overlay">
                              <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                            </div>
                          </div>
                        ) : null}
                        <div 
                          className="magazine-card-image-placeholder"
                          style={{ display: (post.imagePath || getYouTubeThumbnail(post.youtubeUrl)) ? 'none' : 'flex' }}
                        >
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                          </svg>
                          <span>No Image</span>
                        </div>
                      </Link>
                    </div>
                    
                    <div className="magazine-card-content">
                      <div className="magazine-card-meta">
                        <span className="magazine-category">{post.categoryName}</span>
                        <span className="magazine-date">
                          {new Date(post.createdAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      
                      <h2 className="magazine-card-title">
                        <Link to={`/posts/${post.id}`}>
                          {post.title}
                        </Link>
                      </h2>
                      
                      {post.content && (
                        <p className="magazine-card-excerpt">
                          {post.content.replace(/<[^>]*>/g, '').length > 150
                            ? `${post.content.replace(/<[^>]*>/g, '').substring(0, 150)}...`
                            : post.content.replace(/<[^>]*>/g, '')}
                        </p>
                      )}
                      
                      <div className="magazine-card-read-more">
                        <Link to={`/posts/${post.id}`} className="read-more-btn">
                          Read More
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                          </svg>
                        </Link>
                      </div>
                      
                      <div className="magazine-card-footer">
                        <div className="magazine-card-author">
                          <span>By {post.authorUsername || 'Unknown'}</span>
                        </div>
                        <div className="magazine-card-stats">
                          <span>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            {post.viewCount || 0}
                          </span>
                          <button
                            onClick={() => handleLike(post.id)}
                            className={`magazine-like-btn ${likedPosts.has(post.id) ? 'liked' : ''}`}
                            title={likedPosts.has(post.id) ? 'Unlike' : 'Like'}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill={likedPosts.has(post.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                            {post.likeCount || 0}
                          </button>
                          <span>💬 {post.commentCount || 0}</span>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
          
          {/* Ad placement between posts */}
          <AdPlacement position="post-content" />
        </div>
      </div>
    </>
  );
}

export default MagazinePostList;

