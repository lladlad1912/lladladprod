import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { getAllSubmissions, markSubmissionAsRead, deleteSubmission } from '../services/api';
import Sidebar from './Sidebar';
import '../App.css';

const TYPE_LABELS = {
  general: 'General',
  'write-for-lladlad': 'Write for lladlad',
  'client-inquiry': 'Service Inquiry',
};

function AdminSubmissions() {
  const { isAdmin } = useAuth();
  const { sidebarOpen, closeSidebar } = useSidebar();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    if (isAdmin()) loadSubmissions();
  }, [isAdmin, typeFilter]);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const type = typeFilter === 'all' ? null : typeFilter;
      const response = await getAllSubmissions(type);
      setSubmissions(response.data || []);
    } catch (err) {
      setError('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await markSubmissionAsRead(id);
      await loadSubmissions();
    } catch (err) {
      setError('Failed to mark as read');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this submission?')) return;
    try {
      await deleteSubmission(id);
      await loadSubmissions();
    } catch (err) {
      setError('Failed to delete submission');
    }
  };

  if (!isAdmin()) {
    return <div className="error">Admin access required.</div>;
  }

  return (
    <>
      {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar} />}
      <div className="magazine-layout">
        <div className={`sidebar-wrapper ${sidebarOpen ? 'open' : ''}`}>
          <Sidebar onClose={closeSidebar} />
        </div>
        <div className={`magazine-main ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <div className="admin-page">
            <h1>Form Submissions</h1>
            <p className="admin-page-subtitle">Messages from Reach Out, Write for lladlad, and Service Inquiry forms.</p>

            {error && <div className="error">{error}</div>}

            <div className="clients-filters">
              {['all', 'general', 'client-inquiry', 'write-for-lladlad'].map((type) => (
                <button
                  key={type}
                  type="button"
                  className={typeFilter === type ? 'active' : ''}
                  onClick={() => setTypeFilter(type)}
                >
                  {type === 'all' ? 'All' : TYPE_LABELS[type] || type}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="loading">Loading submissions...</div>
            ) : submissions.length === 0 ? (
              <div className="card"><p>No submissions yet.</p></div>
            ) : (
              <div className="submissions-list">
                {submissions.map((sub) => (
                  <article key={sub.id} className={`card submission-card ${sub.isRead ? 'read' : 'unread'}`}>
                    <div className="submission-header">
                      <div>
                        <h3>{sub.name} · {sub.email}</h3>
                        <p className="admin-list-meta">
                          {TYPE_LABELS[sub.submissionType] || sub.submissionType}
                          {sub.serviceType ? ` · ${sub.serviceType}` : ''}
                          {' · '}{new Date(sub.createdAt).toLocaleString()}
                          {!sub.isRead && <span className="unread-badge">New</span>}
                        </p>
                      </div>
                      <div className="admin-list-actions">
                        {!sub.isRead && (
                          <button type="button" className="btn btn-secondary" onClick={() => handleMarkRead(sub.id)}>
                            Mark read
                          </button>
                        )}
                        <button type="button" className="btn btn-secondary" onClick={() => handleDelete(sub.id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                    {sub.subject && <p><strong>Subject:</strong> {sub.subject}</p>}
                    {sub.company && <p><strong>Company:</strong> {sub.company}</p>}
                    {sub.phone && <p><strong>Phone:</strong> {sub.phone}</p>}
                    <p className="submission-message">{sub.message}</p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminSubmissions;
