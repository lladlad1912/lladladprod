// 🔹 CHANGED: single React import, added useRef here
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getComments, getAllComments, createComment, updateComment, deleteComment } from '../services/api';
import { uploadUrl } from '../config';
import '../App.css';

/**
 * 🔹 MOVED: CommentItem is now OUTSIDE CommentSection.
 * This keeps its identity stable so React doesn't remount it on every keystroke.
 */
const CommentItem = ({
  comment,
  depth = 0,
  user,
  replyingTo,
  replyText,
  editingId,
  editText,
  onReplyClick,
  onReplySubmit,
  onReplyCancel,
  onReplyTextChange,
  onEditClick,
  onEditTextChange,
  onEditSave,
  onEditCancel,
  onDeleteComment
}) => {
  const isReply = depth > 0;
  const maxDepth = 3;
  const isEditing = editingId === comment.id;

  // 🔹 ADDED: local ref for this reply textarea
  const replyInputRef = useRef(null);
  const editInputRef = useRef(null);

  // 🔹 ADDED: focus reply box when this comment is the one being replied to
  useEffect(() => {
    if (replyingTo === comment.id && replyInputRef.current) {
      const el = replyInputRef.current;
      el.focus();

      // Put cursor at the end
      const len = el.value.length;
      el.setSelectionRange(len, len);
    }
  }, [replyingTo, comment.id]);

  // Focus edit box when entering edit mode for this comment
  useEffect(() => {
    if (isEditing && editInputRef.current) {
      const el = editInputRef.current;
      el.focus();
      const len = el.value.length;
      el.setSelectionRange(len, len);
    }
  }, [isEditing]);

  return (
    <div className={isReply ? "comment-reply" : ""} style={{ marginBottom: '1rem' }}>
      <div className="card" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              {comment.userProfileImage ? (
                <img 
                  src={uploadUrl(comment.userProfileImage)}
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
            {!isEditing ? (
              <p style={{ margin: '0.5rem 0', lineHeight: '1.6' }}>{comment.content}</p>
            ) : (
              <div style={{ marginTop: '0.75rem', padding: '1rem', background: '#f8f9fa', borderRadius: '6px' }}>
                <textarea
                  ref={editInputRef}
                  className="form-textarea"
                  placeholder="Update your comment..."
                  value={editText}
                  onChange={onEditTextChange}
                  rows="2"
                  style={{ marginBottom: '0.5rem' }}
                />
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => onEditSave(comment.id)}
                    className="btn btn-primary"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                  >
                    Save
                  </button>
                  <button
                    onClick={onEditCancel}
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            
            {user && depth < maxDepth && !isEditing && (
              <button
                onClick={() => onReplyClick(comment.id)}
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
                  ref={replyInputRef}   /* 🔹 ADDED: connect this textarea to the ref */
                  key={`reply-${comment.id}`}
                  className="form-textarea"
                  placeholder="Write a reply..."
                  value={replyText}
                  onChange={onReplyTextChange}
                  rows="2"
                  style={{ marginBottom: '0.5rem' }}
                />
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => onReplySubmit(comment.id)}
                    className="btn btn-primary"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                  >
                    Post Reply
                  </button>
                  <button
                    onClick={onReplyCancel}
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {comment.replies && comment.replies.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                {comment.replies.map((reply) => (
                  <CommentItem 
                    key={reply.id} 
                    comment={reply} 
                    depth={depth + 1}
                    user={user}
                    replyingTo={replyingTo}
                    replyText={replyText}
                    onReplyClick={onReplyClick}
                    onReplySubmit={onReplySubmit}
                    onReplyCancel={onReplyCancel}
                    onReplyTextChange={onReplyTextChange}
                    onDeleteComment={onDeleteComment}
                  />
                ))}
              </div>
            )}
          </div>
          {(user?.id === comment.userId || user?.role === 'ADMIN') && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {!isEditing && (
                <button
                  onClick={() => onEditClick(comment)}
                  className="btn btn-secondary"
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}
                  title="Edit comment"
                >
                  Edit
                </button>
              )}
              <button
                onClick={() => onDeleteComment(comment.id)}
                className="btn btn-danger"
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function CommentSection({ postId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null); // { type: 'success' | 'error', message: string }
  const noticeTimerRef = useRef(null);

  // 🔹 REMOVED replyInputRef + useEffect from here
  // focus is now handled inside CommentItem for the right textarea only

  useEffect(() => {
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    };
  }, []);

  const showNotice = (type, message) => {
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    setNotice({ type, message });
    noticeTimerRef.current = setTimeout(() => setNotice(null), 2500);
  };

  const loadComments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      try {
        const response = await getAllComments(postId);
        if (response && response.data) {
          setComments(Array.isArray(response.data) ? response.data : []);
        } else {
          setComments([]);
        }
      } catch (err) {
        console.warn('getAllComments failed, trying paginated fallback:', err.response?.status || err.message);
        try {
          const response = await getComments(postId, 0, 100);
          if (response && response.data) {
            const commentsData = response.data.content || response.data;
            setComments(Array.isArray(commentsData) ? commentsData : []);
          } else {
            setComments([]);
          }
        } catch (fallbackErr) {
          console.error('Both comment loading methods failed:', {
            getAllComments: err.response?.status || err.message,
            getComments: fallbackErr.response?.status || fallbackErr.message
          });
          
          const status = fallbackErr.response?.status;
          if (status && status >= 500) {
            setError('Server error loading comments. Please try again later.');
          } else if (status && status !== 404) {
            setError(`Failed to load comments (Error ${status}). Please refresh the page.`);
          } else {
            setComments([]);
          }
        }
      }
    } catch (err) {
      console.error('Unexpected error loading comments:', err);
      setError('An unexpected error occurred. Please refresh the page.');
      setComments([]);
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
      showNotice('success', 'Comment posted');
      loadComments();
    } catch (err) {
      setError('Failed to add comment');
      console.error(err);
      showNotice('error', 'Failed to post comment');
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
      showNotice('success', 'Reply posted');
      loadComments();
    } catch (err) {
      setError('Failed to add reply');
      console.error(err);
      showNotice('error', 'Failed to post reply');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Delete this comment?')) {
      try {
        await deleteComment(commentId);
        showNotice('success', 'Comment deleted');
        loadComments();
      } catch (err) {
        setError('Failed to delete comment');
        showNotice('error', 'Failed to delete comment');
      }
    }
  };

  const handleNewCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  const handleReplyTextChange = (e) => {
    setReplyText(e.target.value);
  };

  const totalComments = useMemo(() => {
    const getTotalCommentCount = (commentsList) => {
      let count = commentsList.length;
      commentsList.forEach(comment => {
        if (comment.replies && comment.replies.length > 0) {
          count += getTotalCommentCount(comment.replies);
        }
      });
      return count;
    };
    return getTotalCommentCount(comments);
  }, [comments]);

  const handleReplyClick = (commentId) => {
    // If editing, cancel edit first
    if (editingId) {
      setEditingId(null);
      setEditText('');
    }
    setReplyingTo(replyingTo === commentId ? null : commentId);
  };

  const handleReplyCancel = () => {
    setReplyingTo(null);
    setReplyText('');
  };

  const handleEditClick = (comment) => {
    // Close reply box if open
    setReplyingTo(null);
    setReplyText('');
    setEditingId(comment.id);
    setEditText(comment.content || '');
  };

  const handleEditTextChange = (e) => {
    setEditText(e.target.value);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleEditSave = async (commentId) => {
    if (!user) return;
    if (!editText.trim()) return;
    try {
      await updateComment(commentId, {
        postId: parseInt(postId),
        userId: user.id,
        content: editText
      });
      setEditingId(null);
      setEditText('');
      showNotice('success', 'Comment updated');
      loadComments();
    } catch (err) {
      console.error(err);
      setError('Failed to update comment');
      showNotice('error', 'Failed to update comment');
    }
  };

  if (loading) {
    return <div className="loading">Loading comments...</div>;
  }

  return (
    <div style={{ marginTop: '2rem', borderTop: '1px solid #ddd', paddingTop: '2rem' }}>
      <h3>Comments ({totalComments})</h3>
      
      {notice && (
        <div className={notice.type === 'success' ? 'success' : 'error'}>
          {notice.message}
        </div>
      )}
      {error && <div className="error">{error}</div>}

      {user && (
        <form onSubmit={handleCommentSubmit} style={{ marginBottom: '2rem' }}>
          <div className="form-group">
            <textarea
              className="form-textarea"
              placeholder="Write a comment..."
              value={newComment}
              onChange={handleNewCommentChange}
              rows="3"
              // 🔹 CHANGED: removed custom onWheel to keep scrolling natural
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
            <CommentItem 
              key={comment.id} 
              comment={comment} 
              depth={0}
              user={user}
              replyingTo={replyingTo}
              replyText={replyText}
              editingId={editingId}
              editText={editText}
              onReplyClick={handleReplyClick}
              onReplySubmit={handleReplySubmit}
              onReplyCancel={handleReplyCancel}
              onReplyTextChange={handleReplyTextChange}
              onEditClick={handleEditClick}
              onEditTextChange={handleEditTextChange}
              onEditSave={handleEditSave}
              onEditCancel={handleEditCancel}
              onDeleteComment={handleDeleteComment}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default CommentSection;
