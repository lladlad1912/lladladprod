import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { updateMyProfile, uploadImage } from '../services/api';
import Sidebar from './Sidebar';
import '../App.css';

function ProfileSetup() {
  const navigate = useNavigate();
  const { user, loadCurrentUser } = useAuth();
  const { sidebarOpen, closeSidebar } = useSidebar();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    bio: '',
    profileImage: null
  });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    // Check if user is logged in and has pending profile setup
    const pendingSetup = localStorage.getItem('pendingProfileSetup');
    if (pendingSetup) {
      const userData = JSON.parse(pendingSetup);
      setFormData({
        username: userData.username || '',
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        bio: '',
        profileImage: null
      });
    } else if (user) {
      // If user is already loaded, populate form
      setFormData({
        username: user.username || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        bio: user.bio || '',
        profileImage: null
      });
      if (user.profileImage) {
        setImagePreview(`http://localhost:8080/uploads/${user.profileImage}`);
      }
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      setFormData({ ...formData, profileImage: file });
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let profileImagePath = null;

      // Upload image if provided
      if (formData.profileImage) {
        const uploadResponse = await uploadImage(formData.profileImage);
        profileImagePath = uploadResponse.data;
      }

      // Update profile
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        bio: formData.bio,
      };

      if (profileImagePath) {
        updateData.profileImage = profileImagePath;
      }

      await updateMyProfile(updateData);

      // Clear pending setup flag
      localStorage.removeItem('pendingProfileSetup');

      // Reload user data
      await loadCurrentUser();

      // Redirect to home
      navigate('/');
    } catch (err) {
      setError(err.response?.data || 'Failed to update profile. Please try again.');
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
          <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '0 1rem' }}>
            <div className="card">
              <h2>Complete Your Profile</h2>
              <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
                Welcome! Please complete your profile to get started.
              </p>

              {error && <div className="error">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    name="username"
                    className="form-input"
                    value={formData.username}
                    disabled
                    style={{ background: '#f9fafb', color: '#64748b' }}
                  />
                  <small style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                    Username cannot be changed
                  </small>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      className="form-input"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      className="form-input"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Bio</label>
                  <textarea
                    name="bio"
                    className="form-textarea"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Tell us about yourself..."
                    maxLength={1000}
                  />
                  <small style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                    {formData.bio.length}/1000 characters
                  </small>
                </div>

                <div className="form-group">
                  <label className="form-label">Profile Image</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Profile preview"
                        style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid #e2e8f0'
                        }}
                      />
                    )}
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ fontSize: '0.9rem' }}
                      />
                      <small style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                        Max 5MB. JPG, PNG, or GIF
                      </small>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                  style={{ width: '100%', marginTop: '1rem' }}
                >
                  {loading ? 'Saving...' : 'Complete Profile'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProfileSetup;















