import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { searchPosts, getCategories } from '../services/api';
import '../App.css';

function Sidebar({ onSearchResults }) {
  const { user } = useAuth();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [searching, setSearching] = useState(false);

  React.useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      if (onSearchResults) onSearchResults(null);
      return;
    }

    try {
      setSearching(true);
      const response = await searchPosts(
        searchKeyword,
        selectedCategory || null,
        0,
        20
      );
      const results = response.data.content || response.data;
      if (onSearchResults) onSearchResults(results);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleClear = () => {
    setSearchKeyword('');
    setSelectedCategory('');
    if (onSearchResults) onSearchResults(null);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-card">
        <h3>Search</h3>
        <div className="sidebar-search">
          <input
            type="text"
            placeholder="Search posts..."
            className="form-input"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <select
            className="form-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ marginTop: '0.5rem' }}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
            <button 
              onClick={handleSearch} 
              className="btn btn-primary"
              style={{ flex: 1 }}
              disabled={searching}
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
            {searchKeyword && (
              <button 
                onClick={handleClear} 
                className="btn btn-secondary"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="sidebar-card">
        <h3>Categories</h3>
        <div className="sidebar-categories">
          {categories.length > 0 ? (
            categories.map(cat => (
              <a 
                key={cat.id} 
                href={`#category-${cat.id}`}
                className="category-link"
              >
                {cat.name}
              </a>
            ))
          ) : (
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No categories yet</p>
          )}
        </div>
      </div>

      {user && (
        <div className="sidebar-card">
          <h3>Quick Actions</h3>
          <a href="/posts/new" className="btn btn-primary" style={{ width: '100%', textAlign: 'center', display: 'block' }}>
            + Create New Post
          </a>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;


