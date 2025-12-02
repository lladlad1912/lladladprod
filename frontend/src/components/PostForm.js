import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createPost, getCategories, uploadImage } from '../services/api';
import '../App.css';

function PostForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    youtubeUrl: '',
    categoryId: '',
    imagePath: ''
  });
  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data);
      if (response.data.length > 0) {
        setFormData(prev => ({ ...prev, categoryId: response.data[0].id }));
      }
    } catch (err) {
      setError('Failed to load categories');
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let imagePath = formData.imagePath;
      
      // Upload image if selected
      if (imageFile) {
        const uploadResponse = await uploadImage(imageFile);
        imagePath = uploadResponse.data.filename;
      }

      await createPost({
        title: formData.title,
        content: formData.content,
        youtubeUrl: formData.youtubeUrl,
        imagePath: imagePath,
        userId: user.id,
        categoryId: parseInt(formData.categoryId)
      });
      setSuccess('Post created successfully!');
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      setError(err.response?.data || 'Failed to create post');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Create New Post</h1>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <form onSubmit={handleSubmit} className="card">
        <div className="form-group">
          <label className="form-label">Title *</label>
          <input
            type="text"
            name="title"
            className="form-input"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Content</label>
          <textarea
            name="content"
            className="form-textarea"
            value={formData.content}
            onChange={handleChange}
            placeholder="Write your post content here..."
          />
        </div>

        <div className="form-group">
          <label className="form-label">Post Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="form-input"
          />
          {imagePreview && (
            <div style={{ marginTop: '1rem' }}>
              <img 
                src={imagePreview} 
                alt="Preview" 
                style={{ maxWidth: '300px', maxHeight: '200px', borderRadius: '8px' }}
              />
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">YouTube Video URL</label>
          <input
            type="text"
            name="youtubeUrl"
            className="form-input"
            value={formData.youtubeUrl}
            onChange={handleChange}
            placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
          />
          <small style={{ color: '#666', display: 'block', marginTop: '0.5rem' }}>
            Supports: youtube.com/watch?v=, youtu.be/, or youtube.com/embed/
          </small>
        </div>

        <div className="form-group">
          <label className="form-label">Category *</label>
          <select
            name="categoryId"
            className="form-select"
            value={formData.categoryId}
            onChange={handleChange}
            required
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Post'}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => navigate('/')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default PostForm;


