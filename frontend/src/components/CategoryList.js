import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/api';
import Sidebar from './Sidebar';
import '../App.css';

function CategoryList() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { sidebarOpen, closeSidebar } = useSidebar();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await getCategories();
      setCategories(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load categories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateCategory(editingId, formData);
        setSuccess('Category updated successfully!');
      } else {
        await createCategory(formData);
        setSuccess('Category created successfully!');
      }
      setFormData({ name: '', description: '' });
      setEditingId(null);
      setShowForm(false);
      loadCategories();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data || (editingId ? 'Failed to update category' : 'Failed to create category'));
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleEdit = (category) => {
    setFormData({ name: category.name, description: category.description || '' });
    setEditingId(category.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setFormData({ name: '', description: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory(id);
        loadCategories();
      } catch (err) {
        setError('Failed to delete category');
        console.error(err);
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading categories...</div>;
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
          <div>
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
                <h1 style={{ margin: 0 }}>Categories</h1>
              </div>
              {isAdmin() && (
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    if (showForm) {
                      handleCancel();
                    } else {
                      setShowForm(true);
                    }
                  }}
                >
                  {showForm ? 'Cancel' : '+ Add Category'}
                </button>
              )}
            </div>

            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}

            {showForm && (
              <form onSubmit={handleSubmit} className="card" style={{ marginBottom: '2rem' }}>
                <h2>{editingId ? 'Edit Category' : 'Create New Category'}</h2>
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Update Category' : 'Create Category'}
                </button>
              </form>
            )}

            {categories.length === 0 ? (
              <div className="card">
                <p>No categories yet. Create your first category!</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {categories.map((category) => (
                  <div key={category.id} className="card">
                    <h2>{category.name}</h2>
                    {category.description && (
                      <p style={{ color: '#666', marginTop: '0.5rem' }}>{category.description}</p>
                    )}
                    <div className="post-meta">
                      {category.postCount || 0} post(s) • Created: {new Date(category.createdAt).toLocaleDateString()}
                    </div>
                    {isAdmin() && (
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                        <button 
                          onClick={() => handleEdit(category)} 
                          className="btn btn-secondary"
                          style={{ flex: 1 }}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(category.id)} 
                          className="btn btn-danger"
                          style={{ flex: 1 }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default CategoryList;


