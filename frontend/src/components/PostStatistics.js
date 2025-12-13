import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { getAllPostsStatistics, getPostStatistics } from '../services/api';
import Sidebar from './Sidebar';
import '../App.css';

function PostStatistics() {
  const { id } = useParams();
  const { user, isAdmin, isEditor } = useAuth();
  const { sidebarOpen, closeSidebar } = useSidebar();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allPostsStats, setAllPostsStats] = useState([]);
  const [selectedPostStats, setSelectedPostStats] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(id ? parseInt(id) : null);

  useEffect(() => {
    loadStatistics();
  }, [selectedPostId]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load all posts statistics
      const allStatsResponse = await getAllPostsStatistics();
      setAllPostsStats(allStatsResponse.data);
      
      // If a specific post is selected, load its detailed statistics
      if (selectedPostId) {
        const postStatsResponse = await getPostStatistics(selectedPostId);
        setSelectedPostStats(postStatsResponse.data);
      }
    } catch (err) {
      setError('Failed to load statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostSelect = async (postId) => {
    setSelectedPostId(postId);
    try {
      const response = await getPostStatistics(postId);
      setSelectedPostStats(response.data);
    } catch (err) {
      setError('Failed to load post statistics');
      console.error(err);
    }
  };

  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPostStatistics = () => {
    if (!selectedPostStats) return;
    
    const exportData = [
      {
        'Post ID': selectedPostStats.postId,
        'Post Title': selectedPostStats.postTitle,
        'Total Views': selectedPostStats.totalViews,
        'Unique Visitors': selectedPostStats.uniqueVisitors
      },
      ...selectedPostStats.recentViews.map(view => ({
        'View ID': view.id,
        'Username': view.username,
        'IP Address': view.ipAddress,
        'Country': view.country,
        'City': view.city,
        'Region': view.region,
        'Viewed At': view.viewedAt,
        'User Agent': view.userAgent
      }))
    ];
    
    exportToCSV(exportData, `post-statistics-${selectedPostStats.postId}.csv`);
  };

  const exportCountryStats = () => {
    if (!selectedPostStats || !selectedPostStats.viewsByCountry) return;
    
    const exportData = selectedPostStats.viewsByCountry.map(item => ({
      'Country': item.country,
      'Views': item.count
    }));
    
    exportToCSV(exportData, `country-statistics-${selectedPostStats.postId}.csv`);
  };

  if (loading) {
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
            <div style={{ padding: '0.5rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
              <div className="loading">Loading statistics...</div>
            </div>
          </div>
        </div>
      </>
    );
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
          <div style={{ padding: '0.5rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
            <Link to="/" className="btn btn-back" style={{ marginBottom: '1rem' }}>
              ← Back to Home
            </Link>
            
            <h1>Post Statistics</h1>
            
            {error && <div className="error">{error}</div>}
            
            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem', marginTop: '2rem' }}>
              {/* Posts List */}
              <div className="card">
                <h3>All Posts</h3>
                <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                  {allPostsStats.length === 0 ? (
                    <p>No posts found</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {allPostsStats.map(post => (
                        <button
                          key={post.postId}
                          onClick={() => handlePostSelect(post.postId)}
                          className={`btn ${selectedPostId === post.postId ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.9rem' }}
                        >
                          <div style={{ fontWeight: 'bold' }}>{post.postTitle}</div>
                          <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                            Views: {post.totalViews} | Unique: {post.uniqueVisitors}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Post Details */}
              <div>
                {selectedPostStats ? (
                  <div>
                    <div className="card" style={{ marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2>{selectedPostStats.postTitle}</h2>
                        <button onClick={exportPostStatistics} className="btn btn-primary">
                          Export All Data (CSV)
                        </button>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '1rem', background: '#f0f9ff', borderRadius: '8px', textAlign: 'center' }}>
                          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e3a8a' }}>
                            {selectedPostStats.totalViews}
                          </div>
                          <div style={{ color: '#666', marginTop: '0.5rem' }}>Total Views</div>
                        </div>
                        <div style={{ padding: '1rem', background: '#f0fdf4', borderRadius: '8px', textAlign: 'center' }}>
                          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#166534' }}>
                            {selectedPostStats.uniqueVisitors}
                          </div>
                          <div style={{ color: '#666', marginTop: '0.5rem' }}>Unique Visitors</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Views by Country */}
                    {selectedPostStats.viewsByCountry && selectedPostStats.viewsByCountry.length > 0 && (
                      <div className="card" style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                          <h3>Views by Country</h3>
                          <button onClick={exportCountryStats} className="btn btn-secondary" style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>
                            Export (CSV)
                          </button>
                        </div>
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                              <tr style={{ background: '#f5f5f5' }}>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Country</th>
                                <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Views</th>
                                <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '2px solid #ddd' }}>%</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedPostStats.viewsByCountry.map((item, index) => {
                                const percentage = ((item.count / selectedPostStats.totalViews) * 100).toFixed(1);
                                return (
                                  <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '0.75rem' }}>{item.country}</td>
                                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>{item.count}</td>
                                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>{percentage}%</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    
                    {/* Views by City */}
                    {selectedPostStats.viewsByCity && selectedPostStats.viewsByCity.length > 0 && (
                      <div className="card" style={{ marginBottom: '1.5rem' }}>
                        <h3>Top Cities</h3>
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                              <tr style={{ background: '#f5f5f5' }}>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>City</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Country</th>
                                <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Views</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedPostStats.viewsByCity.slice(0, 20).map((item, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                                  <td style={{ padding: '0.75rem' }}>{item.city}</td>
                                  <td style={{ padding: '0.75rem' }}>{item.country}</td>
                                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>{item.count}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    
                    {/* Recent Views */}
                    {selectedPostStats.recentViews && selectedPostStats.recentViews.length > 0 && (
                      <div className="card">
                        <h3>Recent Views (Last 50)</h3>
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead>
                              <tr style={{ background: '#f5f5f5' }}>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>User</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>IP</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Location</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Viewed At</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedPostStats.recentViews.map((view) => (
                                <tr key={view.id} style={{ borderBottom: '1px solid #eee' }}>
                                  <td style={{ padding: '0.75rem' }}>{view.username}</td>
                                  <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>{view.ipAddress}</td>
                                  <td style={{ padding: '0.75rem' }}>
                                    {view.city !== 'Unknown' ? `${view.city}, ` : ''}
                                    {view.country !== 'Unknown' ? view.country : 'Unknown'}
                                  </td>
                                  <td style={{ padding: '0.75rem', fontSize: '0.85rem' }}>{view.viewedAt}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="card">
                    <p>Select a post from the list to view detailed statistics</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PostStatistics;



