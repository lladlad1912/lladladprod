import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPosts, deletePost, getCategories, getPostsByCategory } from '../services/api';
import Sidebar from './Sidebar';
import Footer from './Footer';
import '../App.css';

function MagazinePostList() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const [posts, setPosts] = useState([]);
  const [displayPosts, setDisplayPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (categoryParam && categories.length > 0) {
      loadPostsByCategory(categoryParam);
    } else if (!categoryParam) {
      loadPosts();
    }
  }, [categoryParam, categories]);

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
      setPosts(allPosts);
      setDisplayPosts(allPosts);
      setError(null);
    } catch (err) {
      setError('Failed to load posts. Make sure the backend is running.');
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
        setPosts(categoryPosts);
        setDisplayPosts(categoryPosts);
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

  const handleSearchResults = (results) => {
    if (results) {
      setDisplayPosts(results);
    } else {
      // If filtering by category, show category posts, otherwise show all
      setDisplayPosts(posts);
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

  if (loading) {
    return <div className="loading">Loading posts...</div>;
  }

  return (
    <>
      <div className="magazine-layout">
        <div className="magazine-main">
          {error && <div className="error">{error}</div>}

          {displayPosts.length === 0 ? (
            <div className="card">
              <p>No posts found. {user && <Link to="/posts/new">Create your first post!</Link>}</p>
            </div>
          ) : (
            <div className="magazine-grid">
              {displayPosts.map((post, index) => {
                // Create varied sizes based on index and image presence
                const hasImage = post.imagePath;
                const sizeClass = hasImage 
                  ? `size-${(index % 4) + 1}` // 4 different sizes (1-4)
                  : 'size-standard';
                
                return (
                  <article 
                    key={post.id} 
                    className={`magazine-card ${sizeClass}`}
                  >
                    {post.imagePath && (
                      <div className="magazine-card-image">
                        <Link to={`/posts/${post.id}`}>
                          <img 
                            src={`http://localhost:8080/uploads/${post.imagePath}`}
                            alt={post.title}
                          />
                        </Link>
                      </div>
                    )}
                    
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
                          {post.content.length > 150
                            ? `${post.content.substring(0, 150)}...`
                            : post.content}
                        </p>
                      )}
                      
                      <div className="magazine-card-footer">
                        <div className="magazine-card-author">
                          <span>By {post.authorUsername}</span>
                        </div>
                        <div className="magazine-card-stats">
                          <span>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            {post.viewCount || 0}
                          </span>
                          <span>❤️ {post.likeCount || 0}</span>
                          <span>💬 {post.commentCount || 0}</span>
                        </div>
                      </div>
                      
                      {(user?.id === post.authorId || user?.role === 'ADMIN') && (
                        <button 
                          onClick={() => handleDelete(post.id)} 
                          className="magazine-delete-btn"
                          title="Delete post"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <Sidebar onSearchResults={handleSearchResults} />
      </div>
      
      <Footer />
    </>
  );
}

export default MagazinePostList;

