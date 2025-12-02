import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCategories, createCategory, deleteCategory } from '../services/api';
import '../App.css';

function CategoryList() {
  const { isAdmin } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
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
      await createCategory(formData);
      setSuccess('Category created successfully!');
      setFormData({ name: '', description: '' });
      setShowForm(false);
      loadCategories();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data || 'Failed to create category');
      setTimeout(() => setError(null), 3000);
    }
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
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Categories</h1>
        {isAdmin() && (
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : '+ Add Category'}
          </button>
        )}
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="card" style={{ marginBottom: '2rem' }}>
          <h2>Create New Category</h2>
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
          <button type="submit" className="btn btn-primary">Create Category</button>
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
                <button 
                  onClick={() => handleDelete(category.id)} 
                  className="btn btn-danger"
                  style={{ marginTop: '1rem' }}
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CategoryList;


