import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPost, deletePost, toggleLike, getLikeCount, incrementPostView } from '../services/api';
import YouTubeEmbed from './YouTubeEmbed';
import CommentSection from './CommentSection';
import '../App.css';

function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [readingProgress, setReadingProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPost();
    
    // Track view when post loads (only once)
    const trackView = async () => {
      try {
        await incrementPostView(id);
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
  }, [id]);

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

  return (
    <div>
      {/* Reading Progress Bar */}
      <div className="reading-progress-bar" style={{ width: `${readingProgress}%` }}></div>
      
      <Link to="/" className="btn btn-back" style={{ marginBottom: '1rem' }}>
        ← Back to Posts
      </Link>

      <div className="card">
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
              alt={post.title}
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

        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            onClick={handleLike}
            className={`btn ${liked ? 'btn-liked' : 'btn-like'}`}
          >
            {liked ? '❤️ Liked' : '🤍 Like'} ({likeCount})
          </button>
          <span style={{ color: '#475569' }}>
            💬 {post.commentCount || 0} comments
          </span>
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

        {(user?.id === post.authorId || user?.role === 'ADMIN') && (
          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
            <button 
              onClick={handleDelete} 
              className="btn btn-danger"
            >
              Delete Post
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PostDetail;


