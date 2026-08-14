import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { getMyDrafts } from '../services/api';
import Sidebar from './Sidebar';
import { uploadUrl } from '../config';
import '../App.css';

function DraftsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { sidebarOpen, closeSidebar } = useSidebar();
  const [drafts, setDrafts] = useState([]);
  const [filteredDrafts, setFilteredDrafts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadDrafts();
  }, [user, navigate]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredDrafts(drafts);
      return;
    }
    const query = searchQuery.toLowerCase();
    setFilteredDrafts(
      drafts.filter((draft) =>
        (draft.title || '').toLowerCase().includes(query) ||
        (draft.categoryName || '').toLowerCase().includes(query)
      )
    );
  }, [searchQuery, drafts]);

  const loadDrafts = async () => {
    try {
      setLoading(true);
      const response = await getMyDrafts();
      const items = response.data || [];
      setDrafts(items);
      setFilteredDrafts(items);
      setError(null);
    } catch (err) {
      setError('Failed to load drafts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const stripHtml = (html) => {
    if (!html) return '';
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  if (!user) {
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
              <h1>My Drafts</h1>
              <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
                Continue unfinished posts ({drafts.length} total)
              </p>

              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Search drafts by title or category..."
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
                </div>
              </div>

              {error && <div className="error">{error}</div>}

              {loading ? (
                <div className="loading">Loading drafts...</div>
              ) : filteredDrafts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                  <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
                    {searchQuery ? 'No drafts match your search' : 'No drafts yet'}
                  </p>
                  {!searchQuery && (
                    <Link to="/posts/new" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
                      Create New Post
                    </Link>
                  )}
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  {filteredDrafts.map((draft) => {
                    const excerpt = stripHtml(draft.content).slice(0, 140);
                    return (
                      <Link
                        key={draft.id}
                        to={`/posts/${draft.id}/edit`}
                        className="card"
                        style={{
                          textDecoration: 'none',
                          display: 'block',
                          transition: 'transform 0.2s, box-shadow 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '';
                        }}
                      >
                        {draft.imagePath && (
                          <div style={{ marginBottom: '1rem' }}>
                            <img
                              src={uploadUrl(draft.imagePath)}
                              alt={draft.title}
                              style={{
                                width: '100%',
                                height: '200px',
                                objectFit: 'cover',
                                borderRadius: '6px'
                              }}
                            />
                          </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                          <span className="status-badge status-badge-draft">Draft</span>
                          {draft.categoryName && (
                            <span style={{
                              display: 'inline-block',
                              padding: '0.25rem 0.75rem',
                              background: '#1e3a8a',
                              color: 'white',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: '500'
                            }}>
                              {draft.categoryName}
                            </span>
                          )}
                        </div>
                        <h3 style={{ marginBottom: '0.5rem', color: '#1e293b' }}>
                          {draft.title || 'Untitled draft'}
                        </h3>
                        {excerpt && (
                          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                            {excerpt}{excerpt.length >= 140 ? '…' : ''}
                          </p>
                        )}
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                          Updated {new Date(draft.updatedAt || draft.createdAt).toLocaleString()}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DraftsPage;
