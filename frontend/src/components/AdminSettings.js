import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { getAllSettings, updateSetting } from '../services/api';
import Sidebar from './Sidebar';
import '../App.css';

function AdminSettings() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { sidebarOpen, closeSidebar } = useSidebar();
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    if (isAdmin()) {
      loadSettings();
    }
  }, [isAdmin]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await getAllSettings();
      setSettings(response.data);
    } catch (err) {
      setError('Failed to load settings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (key, currentValue) => {
    setEditingKey(key);
    setEditValue(currentValue || '');
  };

  const handleSave = async (key) => {
    try {
      setError(null);
      await updateSetting(key, editValue, '');
      setSuccess('Setting updated successfully');
      setEditingKey(null);
      await loadSettings();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data || 'Failed to update setting');
    }
  };

  const handleCancel = () => {
    setEditingKey(null);
    setEditValue('');
  };

  if (!isAdmin()) {
    return <div className="error">Access denied. Admin only.</div>;
  }

  if (loading) {
    return <div className="loading">Loading settings...</div>;
  }

  const socialSettings = [
    { key: 'social_facebook', label: 'Facebook URL', icon: '📘' },
    { key: 'social_instagram', label: 'Instagram URL', icon: '📷' },
    { key: 'social_twitter', label: 'Twitter URL', icon: '🐦' },
    { key: 'social_youtube', label: 'YouTube URL', icon: '📺' }
  ];

  const otherSettings = [
    { key: 'contact_email', label: 'Contact Email' },
    { key: 'footer_description', label: 'Footer Description' }
  ];

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
          <div style={{ maxWidth: '900px', margin: '0.5rem auto', padding: '0 1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <button 
                className="btn btn-secondary"
                onClick={() => navigate('/')}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  fontSize: '0.9rem'
                }}
              >
                ← Back to Home
              </button>
              <h1 style={{ margin: 0 }}>Admin Settings</h1>
            </div>
            
            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}

            <div className="card" style={{ marginBottom: '2rem' }}>
              <h2>Social Media Links</h2>
              <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                Click on any social media link to edit its URL. These links appear in the header and footer.
              </p>
              
              {socialSettings.map(setting => (
                <div key={setting.key} style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{setting.icon}</span>
                    <strong>{setting.label}</strong>
                  </div>
                  {editingKey === setting.key ? (
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="form-input"
                        style={{ flex: 1 }}
                        placeholder="Enter URL"
                      />
                      <button onClick={() => handleSave(setting.key)} className="btn btn-primary">
                        Save
                      </button>
                      <button onClick={handleCancel} className="btn btn-secondary">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <a 
                        href={settings[setting.key] || '#'} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: '#1e3a8a', textDecoration: 'none', flex: 1 }}
                        onClick={(e) => {
                          if (e.ctrlKey || e.metaKey) return; // Allow Ctrl+Click to open
                          e.preventDefault();
                          handleEdit(setting.key, settings[setting.key]);
                        }}
                      >
                        {settings[setting.key] || 'Not set - Click to add'}
                      </a>
                      <button 
                        onClick={() => handleEdit(setting.key, settings[setting.key])}
                        className="btn btn-secondary"
                        style={{ marginLeft: '1rem' }}
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="card">
              <h2>Other Settings</h2>
              {otherSettings.map(setting => (
                <div key={setting.key} style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">{setting.label}</label>
                  {editingKey === setting.key ? (
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      {setting.key === 'footer_description' ? (
                        <textarea
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="form-input"
                          rows="3"
                          style={{ flex: 1 }}
                        />
                      ) : (
                        <input
                          type={setting.key.includes('email') ? 'email' : 'text'}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="form-input"
                          style={{ flex: 1 }}
                        />
                      )}
                      <button onClick={() => handleSave(setting.key)} className="btn btn-primary">
                        Save
                      </button>
                      <button onClick={handleCancel} className="btn btn-secondary">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                      <div style={{ flex: 1, color: '#666' }}>
                        {settings[setting.key] || 'Not set'}
                      </div>
                      <button 
                        onClick={() => handleEdit(setting.key, settings[setting.key])}
                        className="btn btn-secondary"
                        style={{ marginLeft: '1rem' }}
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminSettings;



