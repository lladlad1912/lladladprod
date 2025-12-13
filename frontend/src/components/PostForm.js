import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { createPost, updatePost, getPost, getCategories, getSubCategoriesByCategory, uploadImage } from '../services/api';
import Sidebar from './Sidebar';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../App.css';

function PostForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const { user, isAdmin, isEditor } = useAuth();
  const { sidebarOpen, closeSidebar } = useSidebar();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    youtubeUrl: '',
    categoryId: '',
    subCategoryId: '',
    imagePath: '',
    hashtags: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: ''
  });
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingPost, setLoadingPost] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const quillRef = useRef(null);

  // Header categories that should be visible to all users
  const headerCategories = ['Movies', 'Tech', 'Dharma', 'Gaming'];

  useEffect(() => {
    loadCategories();
  }, []);
  
  useEffect(() => {
    if (isEditMode && id) {
      loadPost();
    }
  }, [id, isEditMode]);
  
  const loadPost = async () => {
    try {
      setLoadingPost(true);
      const response = await getPost(id);
      const post = response.data;
      
      setFormData({
        title: post.title || '',
        content: post.content || '',
        youtubeUrl: post.youtubeUrl || '',
        categoryId: post.categoryId || '',
        subCategoryId: post.subCategoryId || '',
        imagePath: post.imagePath || '',
        hashtags: post.hashtags || '',
        metaTitle: post.metaTitle || '',
        metaDescription: post.metaDescription || '',
        metaKeywords: post.metaKeywords || ''
      });
      
      // Load subcategories for the post's category
      if (post.categoryId) {
        loadSubCategories(post.categoryId);
      }
      
      // Set image preview if image exists
      if (post.imagePath) {
        setImagePreview(`http://localhost:8080/uploads/${post.imagePath}`);
      }
    } catch (err) {
      setError('Failed to load post');
      console.error(err);
    } finally {
      setLoadingPost(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await getCategories();
      let allCategories = response.data || [];
      
      // Filter to show only header categories for all users
      // Use case-insensitive comparison to handle any case differences
      const filteredCategories = allCategories.filter(cat => 
        headerCategories.some(headerCat => 
          headerCat.toLowerCase() === (cat.name || '').toLowerCase()
        )
      );
      
      // If filtered categories exist, use them; otherwise use all categories as fallback
      if (filteredCategories.length > 0) {
        setCategories(filteredCategories);
        if (filteredCategories.length > 0) {
          setFormData(prev => ({ ...prev, categoryId: filteredCategories[0].id }));
        }
      } else if (allCategories.length > 0) {
        // Fallback: show all categories if none match (shouldn't happen, but safety net)
        setCategories(allCategories);
        setFormData(prev => ({ ...prev, categoryId: allCategories[0].id }));
      }
    } catch (err) {
      setError('Failed to load categories');
      console.error('Error loading categories:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // If category changes, load subcategories for that category and reset subcategory
    if (name === 'categoryId') {
      setFormData({
        ...formData,
        [name]: value,
        subCategoryId: '' // Reset subcategory when category changes
      });
      if (value) {
        loadSubCategories(value);
      } else {
        setSubCategories([]);
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const loadSubCategories = async (categoryId) => {
    try {
      const response = await getSubCategoriesByCategory(categoryId);
      setSubCategories(response.data || []);
    } catch (err) {
      console.error('Failed to load subcategories:', err);
      setSubCategories([]);
    }
  };

  const handleContentChange = (value) => {
    setFormData({
      ...formData,
      content: value
    });
  };

  // Custom image handler for ReactQuill
  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        setTimeout(() => setError(null), 3000);
        return;
      }

      try {
        setLoading(true);
        const uploadResponse = await uploadImage(file);
        const imageUrl = `http://localhost:8080/uploads/${uploadResponse.data.filename}`;
        
        // Get the current editor instance from ref
        const quill = quillRef.current?.getEditor();
        if (quill) {
          const range = quill.getSelection(true);
          if (range) {
            quill.insertEmbed(range.index, 'image', imageUrl, 'user');
            quill.setSelection(range.index + 1);
          }
        }
      } catch (err) {
        setError('Failed to upload image: ' + (err.response?.data || err.message));
        console.error('Image upload error:', err);
        setTimeout(() => setError(null), 5000);
      } finally {
        setLoading(false);
      }
    };
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

      const postData = {
        title: formData.title,
        content: formData.content,
        youtubeUrl: formData.youtubeUrl,
        imagePath: imagePath,
        categoryId: parseInt(formData.categoryId),
        hashtags: formData.hashtags,
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
        metaKeywords: formData.metaKeywords
      };
      
      if (formData.subCategoryId) {
        postData.subCategoryId = parseInt(formData.subCategoryId);
      }

      if (isEditMode) {
        await updatePost(id, postData);
        setSuccess('Post updated successfully!');
      } else {
        postData.userId = user.id;
        await createPost(postData);
        setSuccess('Post created successfully!');
      }
      
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      setError(err.response?.data || `Failed to ${isEditMode ? 'update' : 'create'} post`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
          <div style={{ maxWidth: '800px', margin: '0.5rem auto', padding: '0 1rem' }}>
            <h1>{isEditMode ? 'Edit Post' : 'Create New Post'}</h1>
            
            {loadingPost && <div className="loading">Loading post...</div>}
      
            {!loadingPost && (
              <>
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

        <div className="form-group" style={{ marginBottom: '2rem' }}>
          <label className="form-label">Content *</label>
          <div className="editor-wrapper" style={{ marginBottom: '1rem' }}>
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={formData.content}
              onChange={handleContentChange}
              placeholder="Write your post content here... (Supports Telugu and English)"
              modules={{
                toolbar: {
                  container: [
                    [{ 'header': [1, 2, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['link', 'image'],
                    ['clean']
                  ],
                  handlers: {
                    image: imageHandler
                  }
                }
              }}
              formats={[
                'header',
                'bold', 'italic', 'underline', 'strike',
                'list', 'bullet',
                'link', 'image'
              ]}
            />
          </div>
          <small style={{ color: '#666', display: 'block', marginTop: '0.5rem' }}>
            💡 Tip: Click the image icon in the toolbar to upload and insert images inline in your post
          </small>
        </div>

        <div className="form-group">
          <label className="form-label">Hashtags</label>
          <input
            type="text"
            name="hashtags"
            className="form-input"
            value={formData.hashtags}
            onChange={handleChange}
            placeholder="Enter hashtags separated by commas (e.g., #tech, #blogging, #telugu)"
          />
          <small style={{ color: '#666', display: 'block', marginTop: '0.5rem' }}>
            Separate multiple hashtags with commas
          </small>
        </div>

        <div className="form-group">
          <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>SEO Settings</h3>
          <label className="form-label">Meta Title</label>
          <input
            type="text"
            name="metaTitle"
            className="form-input"
            value={formData.metaTitle}
            onChange={handleChange}
            placeholder="SEO title for search engines (recommended: 50-60 characters)"
            maxLength={200}
          />
          <small style={{ color: '#666', display: 'block', marginTop: '0.5rem' }}>
            {formData.metaTitle.length}/200 characters
          </small>
        </div>

        <div className="form-group">
          <label className="form-label">Meta Description</label>
          <textarea
            name="metaDescription"
            className="form-textarea"
            value={formData.metaDescription}
            onChange={handleChange}
            placeholder="Brief description for search engines (recommended: 150-160 characters)"
            rows={3}
            maxLength={500}
          />
          <small style={{ color: '#666', display: 'block', marginTop: '0.5rem' }}>
            {formData.metaDescription.length}/500 characters
          </small>
        </div>

        <div className="form-group">
          <label className="form-label">Meta Keywords</label>
          <input
            type="text"
            name="metaKeywords"
            className="form-input"
            value={formData.metaKeywords}
            onChange={handleChange}
            placeholder="Comma-separated keywords for SEO (e.g., blog, technology, telugu content)"
            maxLength={500}
          />
          <small style={{ color: '#666', display: 'block', marginTop: '0.5rem' }}>
            Separate keywords with commas
          </small>
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

        {formData.categoryId && subCategories.length > 0 && (
          <div className="form-group">
            <label className="form-label">Sub Category (Optional)</label>
            <select
              name="subCategoryId"
              className="form-select"
              value={formData.subCategoryId}
              onChange={handleChange}
            >
              <option value="">No subcategory</option>
              {subCategories.map(subCategory => (
                <option key={subCategory.id} value={subCategory.id}>
                  {subCategory.name}
                </option>
              ))}
            </select>
            <small style={{ color: '#666', display: 'block', marginTop: '0.5rem' }}>
              Optional: Select a subcategory to further categorize your post
            </small>
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading || loadingPost}
          >
            {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Post' : 'Create Post')}
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
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default PostForm;


