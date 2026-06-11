import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { getSubCategories, getCategories, createSubCategory, updateSubCategory, deleteSubCategory } from '../services/api';
import Sidebar from './Sidebar';
import '../App.css';

function SubCategoryList() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { sidebarOpen, closeSidebar } = useSidebar();
  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: ''
  });

  useEffect(() => {
    if (isAdmin()) {
      loadData();
    }
  }, [isAdmin]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load categories and subcategories
      const [subCatsRes, catsRes] = await Promise.all([
        getSubCategories().catch(err => {
          console.error('Error loading subcategories:', err);
          return { data: [] };
        }),
        getCategories().catch(err => {
          console.error('Error loading categories:', err);
          return { data: [] };
        })
      ]);
      
      const loadedCategories = catsRes.data || [];
      const loadedSubCategories = subCatsRes.data || [];
      
      console.log('Loaded categories:', loadedCategories);
      console.log('Loaded subcategories:', loadedSubCategories);
      
      if (loadedCategories.length === 0) {
        setError('No categories found. Please create categories first in the Categories page.');
      }
      
      setSubCategories(loadedSubCategories);
      setCategories(loadedCategories);
    } catch (err) {
      setError('Failed to load data. Please check if the backend is running.');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log('Form change:', name, value);
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      // Transform formData to match backend expectations
      const payload = {
        name: formData.name,
        description: formData.description || null,
        category: {
          id: parseInt(formData.categoryId)
        }
      };

      if (editingId) {
        await updateSubCategory(editingId, payload);
        setSuccess('SubCategory updated successfully!');
      } else {
        await createSubCategory(payload);
        setSuccess('SubCategory created successfully!');
      }
      resetForm();
      loadData();
    } catch (err) {
      setError(err.response?.data || 'Failed to save subcategory');
      console.error(err);
    }
  };

  const handleEdit = (subCategory) => {
    setFormData({
      name: subCategory.name,
      description: subCategory.description || '',
      categoryId: subCategory.categoryId.toString()
    });
    setEditingId(subCategory.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subcategory?')) {
      return;
    }
    try {
      await deleteSubCategory(id);
      setSuccess('SubCategory deleted successfully!');
      loadData();
    } catch (err) {
      setError(err.response?.data || 'Failed to delete subcategory');
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      categoryId: ''
    });
    setEditingId(null);
  };

  if (!isAdmin()) {
    return <div className="error">Access denied. Admin only.</div>;
  }

  if (loading) {
    return <div className="loading">Loading subcategories...</div>;
  }

  // Group subcategories by category
  const groupedSubCategories = categories.map(category => ({
    category,
    subCategories: subCategories.filter(sc => Number(sc.categoryId) === Number(category.id))
  }));

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
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
          <h1 style={{ margin: 0 }}>Manage SubCategories</h1>
        </div>
        <button 
          onClick={loadData} 
          className="btn btn-secondary"
          style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
        >
          🔄 Refresh
        </button>
      </div>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      
      {!loading && categories.length === 0 && (
        <div style={{ padding: '1rem', background: '#e7f3ff', borderRadius: '6px', marginBottom: '1rem', border: '1px solid #1e3a8a' }}>
          <strong style={{ color: '#1e3a8a' }}>No categories found.</strong>
          <p style={{ margin: '0.5rem 0 0 0', color: '#1e40af' }}>
            Categories should be automatically created on first run. If you don't see any categories:
          </p>
          <ul style={{ margin: '0.5rem 0 0 1.5rem', color: '#1e40af' }}>
            <li>Check the browser console (F12) for errors</li>
            <li>Verify the backend API is reachable (check REACT_APP_API_URL)</li>
            <li>Go to the <a href="/categories" style={{ color: '#1e3a8a', fontWeight: 'bold' }}>Categories</a> page to create categories</li>
            <li>Click the Refresh button above to reload</li>
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card" style={{ marginBottom: '2rem', position: 'relative', zIndex: 1 }}>
        <h2>{editingId ? 'Edit SubCategory' : 'Create New SubCategory'}</h2>
        
        <div className="form-group">
          <label className="form-label">Category *</label>
          {categories.length === 0 ? (
            <div style={{ padding: '1rem', background: '#fff3cd', borderRadius: '4px', color: '#856404', border: '1px solid #ffc107' }}>
              <strong>No categories available.</strong>
              <p style={{ margin: '0.5rem 0 0 0' }}>
                Please create categories first by going to the{' '}
                <a href="/categories" style={{ color: '#1e3a8a', textDecoration: 'underline', fontWeight: 'bold' }}>
                  Categories
                </a>{' '}
                page in the sidebar.
              </p>
              <button 
                onClick={loadData} 
                className="btn btn-secondary" 
                style={{ marginTop: '0.5rem' }}
              >
                Refresh Categories
              </button>
            </div>
          ) : (
            <>
              <select
                name="categoryId"
                className="form-select"
                value={formData.categoryId || ''}
                onChange={handleChange}
                required
                style={{ 
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  WebkitAppearance: 'menulist',
                  MozAppearance: 'menulist',
                  appearance: 'menulist',
                  zIndex: 10,
                  position: 'relative'
                }}
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={String(category.id)}>
                    {category.name}
                  </option>
                ))}
              </select>
              {formData.categoryId && (
                <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#e7f3ff', borderRadius: '4px', color: '#0066cc', fontSize: '0.9rem' }}>
                  ✓ Selected: {categories.find(c => String(c.id) === formData.categoryId)?.name || 'Unknown'}
                </div>
              )}
            </>
          )}
          {categories.length > 0 && (
            <small style={{ color: '#666', display: 'block', marginTop: '0.5rem' }}>
              {categories.length} categor{categories.length === 1 ? 'y' : 'ies'} available
            </small>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">SubCategory Name *</label>
          <input
            type="text"
            name="name"
            className="form-input"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter subcategory name"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            name="description"
            className="form-textarea"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter subcategory description (optional)"
            rows={3}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" className="btn btn-primary">
            {editingId ? 'Update SubCategory' : 'Create SubCategory'}
          </button>
          {editingId && (
            <button type="button" className="btn btn-secondary" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div>
        <h2>All SubCategories</h2>
        {groupedSubCategories.map(({ category, subCategories: subCats }) => (
          <div key={category.id} className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ color: '#1e3a8a', marginBottom: '1rem' }}>{category.name}</h3>
            {subCats.length === 0 ? (
              <p style={{ color: '#666' }}>No subcategories for this category yet.</p>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {subCats.map(subCat => (
                  <div key={subCat.id} style={{ 
                    padding: '1rem', 
                    background: '#f8f9fa', 
                    borderRadius: '6px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <strong>{subCat.name}</strong>
                      {subCat.description && (
                        <p style={{ margin: '0.5rem 0 0 0', color: '#666', fontSize: '0.9rem' }}>
                          {subCat.description}
                        </p>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleEdit(subCat)}
                        className="btn btn-secondary"
                        style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(subCat.id)}
                        className="btn btn-danger"
                        style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
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

export default SubCategoryList;

