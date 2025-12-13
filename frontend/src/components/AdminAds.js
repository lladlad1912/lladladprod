import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { getAllAds, createAd, updateAd, deleteAd, reorderAds } from '../services/api';
import Sidebar from './Sidebar';
import '../App.css';

function AdminAds() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { sidebarOpen, closeSidebar } = useSidebar();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [draggedAd, setDraggedAd] = useState(null);
  const [formData, setFormData] = useState({
    adCode: '',
    placementName: '',
    position: 'sidebar',
    displayOrder: 0,
    isActive: true,
    width: '100%',
    height: 'auto'
  });

  useEffect(() => {
    if (isAdmin()) {
      loadAds();
    }
  }, [isAdmin]);

  const loadAds = async () => {
    try {
      setLoading(true);
      const response = await getAllAds();
      setAds(response.data);
    } catch (err) {
      setError('Failed to load ads');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      if (editingAd) {
        await updateAd(editingAd.id, formData);
        setSuccess('Ad updated successfully');
      } else {
        await createAd(formData);
        setSuccess('Ad created successfully');
      }
      setShowForm(false);
      setEditingAd(null);
      resetForm();
      await loadAds();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data || 'Failed to save ad');
    }
  };

  const handleEdit = (ad) => {
    setEditingAd(ad);
    setFormData({
      adCode: ad.adCode || '',
      placementName: ad.placementName || '',
      position: ad.position || 'sidebar',
      displayOrder: ad.displayOrder || 0,
      isActive: ad.isActive !== undefined ? ad.isActive : true,
      width: ad.width || '100%',
      height: ad.height || 'auto'
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this ad?')) {
      try {
        await deleteAd(id);
        setSuccess('Ad deleted successfully');
        await loadAds();
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError('Failed to delete ad');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      adCode: '',
      placementName: '',
      position: 'sidebar',
      displayOrder: 0,
      isActive: true,
      width: '100%',
      height: 'auto'
    });
  };

  const handleDragStart = (e, ad) => {
    setDraggedAd(ad);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetAd) => {
    e.preventDefault();
    if (!draggedAd || draggedAd.id === targetAd.id) return;

    const draggedIndex = ads.findIndex(a => a.id === draggedAd.id);
    const targetIndex = ads.findIndex(a => a.id === targetAd.id);

    const newAds = [...ads];
    const [removed] = newAds.splice(draggedIndex, 1);
    newAds.splice(targetIndex, 0, removed);

    // Update display orders
    const updatedAds = newAds.map((ad, index) => ({
      ...ad,
      displayOrder: index + 1
    }));

    try {
      await reorderAds(updatedAds);
      setAds(updatedAds);
      setSuccess('Ad order updated');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError('Failed to update ad order');
    }

    setDraggedAd(null);
  };

  const handleDragEnd = () => {
    setDraggedAd(null);
  };

  if (!isAdmin()) {
    return <div className="error">Access denied. Admin only.</div>;
  }

  if (loading) {
    return <div className="loading">Loading ads...</div>;
  }

  const positions = [
    { value: 'header', label: 'Header' },
    { value: 'sidebar', label: 'Sidebar' },
    { value: 'post-content', label: 'Between Posts' },
    { value: 'footer', label: 'Footer' }
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
          <div style={{ maxWidth: '1200px', margin: '0.5rem auto', padding: '0 1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
          <h1 style={{ margin: 0 }}>Ad Management</h1>
        </div>
        <button 
          onClick={() => {
            resetForm();
            setEditingAd(null);
            setShowForm(true);
          }}
          className="btn btn-primary"
        >
          + Add New Ad
        </button>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2>{editingAd ? 'Edit Ad' : 'Create New Ad'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Placement Name *</label>
              <input
                type="text"
                name="placementName"
                value={formData.placementName}
                onChange={handleInputChange}
                className="form-input"
                required
                placeholder="e.g., Sidebar Ad 1"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Position *</label>
              <select
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                className="form-input"
                required
              >
                {positions.map(pos => (
                  <option key={pos.value} value={pos.value}>{pos.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Ad Code (HTML/JavaScript) *</label>
              <textarea
                name="adCode"
                value={formData.adCode}
                onChange={handleInputChange}
                className="form-input"
                rows="8"
                required
                placeholder="Paste your Google AdSense code or custom HTML here"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Width</label>
                <input
                  type="text"
                  name="width"
                  value={formData.width}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="e.g., 300px, 100%"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Height</label>
                <input
                  type="text"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="e.g., 250px, auto"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Display Order</label>
                <input
                  type="number"
                  name="displayOrder"
                  value={formData.displayOrder}
                  onChange={handleInputChange}
                  className="form-input"
                  min="0"
                />
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                />
                Active (Show on website)
              </label>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary">
                {editingAd ? 'Update Ad' : 'Create Ad'}
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setShowForm(false);
                  setEditingAd(null);
                  resetForm();
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h2>All Ads ({ads.length})</h2>
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          Drag and drop ads to reorder them. Ads are displayed based on their position and display order.
        </p>
        
        {ads.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>
            No ads created yet. Click "Add New Ad" to create one.
          </p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {ads.map((ad, index) => (
              <div
                key={ad.id}
                draggable
                onDragStart={(e) => handleDragStart(e, ad)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, ad)}
                onDragEnd={handleDragEnd}
                style={{
                  padding: '1rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  background: draggedAd?.id === ad.id ? '#f0f9ff' : 'white',
                  cursor: 'move',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#666' }}>#{index + 1}</span>
                    <strong>{ad.placementName}</strong>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      background: ad.isActive ? '#d1fae5' : '#fee2e2',
                      color: ad.isActive ? '#065f46' : '#991b1b'
                    }}>
                      {ad.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#666' }}>
                    Position: <strong>{ad.position}</strong> | 
                    Order: <strong>{ad.displayOrder}</strong> | 
                    Size: <strong>{ad.width} × {ad.height}</strong>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleEdit(ad)} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(ad.id)} className="btn btn-danger" style={{ fontSize: '0.85rem' }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
          </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminAds;



