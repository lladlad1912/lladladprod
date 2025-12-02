import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getComments, getAllComments, createComment, deleteComment } from '../services/api';
import '../App.css';

function CommentSection({ postId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      // Try to get all comments with nested structure
      try {
        const response = await getAllComments(postId);
        setComments(response.data);
      } catch (err) {
        // Fallback to paginated comments
        const response = await getComments(postId, 0, 100);
        const commentsData = response.data.content || response.data;
        setComments(commentsData);
      }
      setError(null);
    } catch (err) {
      setError('Failed to load comments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!newComment.trim()) return;

    try {
      await createComment({
        postId: parseInt(postId),
        userId: user.id,
        content: newComment
      });
      setNewComment('');
      loadComments();
    } catch (err) {
      setError('Failed to add comment');
      console.error(err);
    }
  };

  const handleReplySubmit = async (parentId) => {
    if (!user) return;
    if (!replyText.trim()) return;

    try {
      await createComment({
        postId: parseInt(postId),
        userId: user.id,
        content: replyText,
        parentId: parentId
      });
      setReplyText('');
      setReplyingTo(null);
      loadComments();
    } catch (err) {
      setError('Failed to add reply');
      console.error(err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Delete this comment?')) {
      try {
        await deleteComment(commentId);
        loadComments();
      } catch (err) {
        setError('Failed to delete comment');
      }
    }
  };

  const CommentItem = ({ comment, depth = 0 }) => {
    const isReply = depth > 0;
    const maxDepth = 3; // Limit nesting depth

    return (
      <div className={isReply ? "comment-reply" : ""} style={{ marginBottom: '1rem' }}>
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                {comment.userProfileImage ? (
                  <img 
                    src={`http://localhost:8080/uploads/${comment.userProfileImage}`}
                    alt={comment.username}
                    style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                  />
                ) : (
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#667eea',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.9rem',
                    fontWeight: 'bold'
                  }}>
                    {comment.username?.charAt(0).toUpperCase()}
                  </div>
                )}
                <strong>{comment.username}</strong>
                <span style={{ color: '#666', fontSize: '0.85rem' }}>
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
              </div>
              <p style={{ margin: '0.5rem 0', lineHeight: '1.6' }}>{comment.content}</p>
              
              {user && depth < maxDepth && (
                <button
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  className="btn"
                  style={{
                    background: 'transparent',
                    color: '#667eea',
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.85rem',
                    marginTop: '0.5rem',
                    border: '1px solid #667eea'
                  }}
                >
                  {replyingTo === comment.id ? 'Cancel' : 'Reply'}
                </button>
              )}

              {replyingTo === comment.id && (
                <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '6px' }}>
                  <textarea
                    className="form-textarea"
                    placeholder="Write a reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows="2"
                    style={{ marginBottom: '0.5rem' }}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleReplySubmit(comment.id)}
                      className="btn btn-primary"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                    >
                      Post Reply
                    </button>
                    <button
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyText('');
                      }}
                      className="btn btn-secondary"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Render replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  {comment.replies.map((reply) => (
                    <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
                  ))}
                </div>
              )}
            </div>
            {(user?.id === comment.userId || user?.role === 'ADMIN') && (
              <button
                onClick={() => handleDeleteComment(comment.id)}
                className="btn btn-danger"
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="loading">Loading comments...</div>;
  }

  return (
    <div style={{ marginTop: '2rem', borderTop: '1px solid #ddd', paddingTop: '2rem' }}>
      <h3>Comments ({comments.length})</h3>
      
      {error && <div className="error">{error}</div>}

      {user && (
        <form onSubmit={handleCommentSubmit} style={{ marginBottom: '2rem' }}>
          <div className="form-group">
            <textarea
              className="form-textarea"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows="3"
            />
          </div>
          <button type="submit" className="btn btn-primary">Post Comment</button>
        </form>
      )}

      {!user && (
        <p style={{ color: '#666', marginBottom: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '6px' }}>
          <a href="/login" style={{ color: '#667eea', textDecoration: 'none' }}>Login</a> to post a comment
        </p>
      )}

      <div>
        {comments.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} depth={0} />
          ))
        )}
      </div>
    </div>
  );
}

export default CommentSection;

