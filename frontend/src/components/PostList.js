import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPosts, deletePost, searchPosts, getCategories } from '../services/api';
import YouTubeEmbed from './YouTubeEmbed';
import '../App.css';

function PostList() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCategories();
    loadPosts();
  }, []);

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
      setPosts(response.data.content || response.data);
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

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      loadPosts();
      return;
    }

    try {
      setLoading(true);
      const response = await searchPosts(
        searchKeyword, 
        selectedCategory || null, 
        0, 
        10
      );
      setPosts(response.data.content || response.data);
      setError(null);
    } catch (err) {
      setError('Failed to search posts');
      console.error(err);
    } finally {
      setLoading(false);
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
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>All Posts</h1>
        {user && (
          <Link to="/posts/new" className="btn btn-primary">
            + Create New Post
          </Link>
        )}
      </div>

      {/* Search Bar */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search posts..."
            className="form-input"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            style={{ flex: 1, minWidth: '200px' }}
          />
          <select
            className="form-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ minWidth: '150px' }}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <button onClick={handleSearch} className="btn btn-primary">
            Search
          </button>
          {searchKeyword && (
            <button onClick={() => { setSearchKeyword(''); setSelectedCategory(''); loadPosts(); }} className="btn btn-secondary">
              Clear
            </button>
          )}
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {posts.length === 0 ? (
        <div className="card">
          <p>No posts yet. Create your first post!</p>
        </div>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="card">
            <h2>
              <Link to={`/posts/${post.id}`} style={{ textDecoration: 'none', color: '#333' }}>
                {post.title}
              </Link>
            </h2>
            <div className="post-meta">
              By <strong>{post.authorUsername}</strong> in <strong>{post.categoryName}</strong> • {new Date(post.createdAt).toLocaleDateString()}
            </div>
            {post.content && (
              <div className="post-content">
                {post.content.length > 200 
                  ? `${post.content.substring(0, 200)}...` 
                  : post.content}
              </div>
            )}
            {post.youtubeEmbedUrl && (
              <YouTubeEmbed embedUrl={post.youtubeEmbedUrl} />
            )}
            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to={`/posts/${post.id}`} className="btn btn-secondary">
                Read More
              </Link>
              <span style={{ color: '#666', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                ❤️ {post.likeCount || 0} • 💬 {post.commentCount || 0}
              </span>
              {(user?.id === post.authorId || user?.role === 'ADMIN') && (
                <button 
                  onClick={() => handleDelete(post.id)} 
                  className="btn btn-danger"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default PostList;


