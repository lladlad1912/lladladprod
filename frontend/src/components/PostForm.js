import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { createPost, updatePost, getPost, getCategories, getSubCategoriesByCategory, uploadImage } from '../services/api';
import Sidebar from './Sidebar';
import RichTextEditor from './RichTextEditor';
import { uploadUrl, resolveUploadUrl } from '../config';
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
  const [postStatus, setPostStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [loadingPost, setLoadingPost] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const busy = loading || savingDraft || loadingPost;

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
      setPostStatus(post.status || null);
      
      // Load subcategories for the post's category
      if (post.categoryId) {
        loadSubCategories(post.categoryId);
      }
      
      // Set image preview if image exists
      if (post.imagePath) {
        setImagePreview(uploadUrl(post.imagePath));
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
      const allCategories = response.data || [];

      // Show all categories for post creation/edit.
      setCategories(allCategories);
      if (allCategories.length > 0 && !formData.categoryId) {
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

  const handleContentChange = (html) => {
    setFormData((prev) => ({ ...prev, content: html }));
  };

  const handleInlineImageUpload = async (file) => {
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      setTimeout(() => setError(null), 3000);
      return null;
    }

    try {
      setLoading(true);
      const uploadResponse = await uploadImage(file);
      const { url, filename } = uploadResponse.data || {};
      if (url) {
        return resolveUploadUrl(url);
      }
      if (filename) {
        return uploadUrl(filename);
      }
      return null;
    } catch (err) {
      setError('Failed to upload image: ' + (err.response?.data || err.message));
      console.error('Image upload error:', err);
      setTimeout(() => setError(null), 5000);
      return null;
    } finally {
      setLoading(false);
    }
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

  const isBlankHtml = (html) => {
    const text = (html || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    return !text;
  };

  const getPublishStatus = () => (isAdmin() || isEditor() ? 'PUBLISHED' : 'PENDING_REVIEW');

  const buildPostPayload = async (status) => {
    let imagePath = formData.imagePath;

    if (imageFile) {
      const uploadResponse = await uploadImage(imageFile);
      imagePath = uploadResponse.data.filename;
    }

    const postData = {
      title: formData.title.trim(),
      content: formData.content,
      youtubeUrl: formData.youtubeUrl,
      imagePath: imagePath,
      categoryId: parseInt(formData.categoryId, 10),
      hashtags: formData.hashtags,
      metaTitle: formData.metaTitle,
      metaDescription: formData.metaDescription,
      metaKeywords: formData.metaKeywords,
      status
    };

    if (formData.subCategoryId) {
      postData.subCategoryId = parseInt(formData.subCategoryId, 10);
    }

    if (!isEditMode) {
      postData.userId = user.id;
    }

    return postData;
  };

  const handleSaveDraft = async () => {
    if (!formData.title.trim()) {
      setError('Add a title before saving a draft');
      return;
    }
    if (!formData.categoryId) {
      setError('Select a category before saving a draft');
      return;
    }

    setSavingDraft(true);
    setError(null);
    setSuccess(null);

    try {
      const postData = await buildPostPayload('DRAFT');
      if (isEditMode) {
        await updatePost(id, postData);
        setPostStatus('DRAFT');
        setSuccess('Draft saved.');
      } else {
        const response = await createPost(postData);
        setPostStatus('DRAFT');
        setSuccess('Draft saved.');
        const draftId = response.data?.id;
        if (draftId) {
          setTimeout(() => {
            navigate(`/posts/${draftId}/edit`, { replace: true });
          }, 600);
        }
      }
    } catch (err) {
      setError(err.response?.data || 'Failed to save draft');
      console.error(err);
    } finally {
      setSavingDraft(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!formData.categoryId) {
      setError('Category is required');
      return;
    }
    if (isBlankHtml(formData.content)) {
      setError('Add some content before publishing');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const publishStatus = getPublishStatus();
      const postData = await buildPostPayload(publishStatus);

      if (isEditMode) {
        await updatePost(id, postData);
        setPostStatus(publishStatus);
        setSuccess(publishStatus === 'PENDING_REVIEW' ? 'Post submitted for review!' : 'Post published successfully!');
      } else {
        await createPost(postData);
        setSuccess(publishStatus === 'PENDING_REVIEW' ? 'Post submitted for review!' : 'Post created successfully!');
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <h1 style={{ margin: 0 }}>{isEditMode ? 'Edit Post' : 'Create New Post'}</h1>
                {postStatus === 'DRAFT' && (
                  <span className="status-badge status-badge-draft">Draft</span>
                )}
                {postStatus === 'PENDING_REVIEW' && (
                  <span className="status-badge status-badge-pending">Pending review</span>
                )}
              </div>
              {isEditMode && (
                <button
                  type="button"
                  className="btn btn-back"
                  onClick={() => {
                    // Prefer browser back; fallback to home if history stack isn't available.
                    try {
                      navigate(-1);
                    } catch (e) {
                      navigate('/');
                    }
                  }}
                >
                  ← Back
                </button>
              )}
            </div>
            
            {loadingPost && <div className="loading">Loading post...</div>}
      
            {!loadingPost && (
              <>
                {error && <div className="error">{error}</div>}
                {success && <div className="success">{success}</div>}

                <form onSubmit={handleSubmit} className="card" style={{ position: 'relative', zIndex: 1 }}>
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
          <div className="editor-wrapper">
            <RichTextEditor
              value={formData.content}
              onChange={handleContentChange}
              placeholder="Write your post content here... (Supports Telugu and English)"
              onUploadImage={handleInlineImageUpload}
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

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button 
            type="button" 
            className="btn btn-draft"
            onClick={handleSaveDraft}
            disabled={busy}
          >
            {savingDraft ? 'Saving draft...' : 'Save Draft'}
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={busy}
          >
            {loading
              ? (postStatus === 'DRAFT' || !isEditMode
                  ? ((isAdmin() || isEditor()) ? 'Publishing...' : 'Submitting...')
                  : 'Updating...')
              : (postStatus === 'DRAFT'
                  ? ((isAdmin() || isEditor()) ? 'Publish' : 'Submit for Review')
                  : (isEditMode ? 'Update Post' : ((isAdmin() || isEditor()) ? 'Create Post' : 'Submit for Review')))}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => navigate(postStatus === 'DRAFT' ? '/drafts' : '/')}
            disabled={busy}
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


