import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { getUserProfile, uploadImage, updateMyProfile, getFollowCounts } from '../services/api';
import Sidebar from './Sidebar';
import '../App.css';

function UserProfile() {
  const { user: authUser, loadCurrentUser } = useAuth();
  const { sidebarOpen, closeSidebar } = useSidebar();
  const [user, setUser] = useState(authUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editing, setEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [followCounts, setFollowCounts] = useState({ following: 0, followers: 0 });
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    bio: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (user?.id) {
      loadFollowCounts();
    }
  }, [user?.id]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await getUserProfile();
      setUser(response.data);
      setFormData({
        email: response.data.email || '',
        password: '',
        confirmPassword: '',
        firstName: response.data.firstName || '',
        lastName: response.data.lastName || '',
        bio: response.data.bio || ''
      });
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadFollowCounts = async () => {
    try {
      if (user?.id) {
        const response = await getFollowCounts(user.id);
        setFollowCounts(response.data);
      }
    } catch (err) {
      console.error('Failed to load follow counts:', err);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setError(null);
      const response = await uploadImage(file);
      const imagePath = response.data.filename || response.data.url?.split('/').pop();
      
      // Update profile with new image path
      await updateMyProfile({ profileImage: imagePath });
      setSuccess('Profile image updated successfully');
      await loadProfile();
      loadCurrentUser(); // Refresh user data in context
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data || 'Failed to upload image');
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate password if provided
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      const updateData = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        bio: formData.bio
      };

      // Only include password if it's provided
      if (formData.password) {
        updateData.password = formData.password;
      }

      await updateMyProfile(updateData);
      setSuccess('Profile updated successfully');
      setEditing(false);
      await loadProfile();
      loadCurrentUser(); // Refresh user data in context
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data || 'Failed to update profile');
      console.error(err);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setError(null);
    // Reset form data to current user data
    setFormData({
      email: user?.email || '',
      password: '',
      confirmPassword: '',
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      bio: user?.bio || ''
    });
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
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
          <div style={{ maxWidth: '800px', margin: '0.5rem auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h1>My Profile</h1>
              {!editing && (
                <button 
                  onClick={() => setEditing(true)}
                  className="btn btn-primary"
                >
                  Edit Profile
                </button>
              )}
            </div>
            
            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}

            <div className="card">
              <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}>
                  {user?.profileImage ? (
                    <img 
                      src={user.profileImage.startsWith('http') ? user.profileImage : `http://localhost:8080/uploads/${user.profileImage}`} 
                      alt="Profile" 
                      style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ 
                      width: '150px', 
                      height: '150px', 
                      borderRadius: '50%', 
                      background: '#ddd',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '3rem',
                      margin: '0 auto'
                    }}>
                      {user?.username?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div style={{ marginTop: '1rem' }}>
                    <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                      Change Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                </div>

                <div style={{ flex: 1, minWidth: '300px' }}>
                  {!editing ? (
                    <>
                      <h2>{user?.firstName || user?.username} {user?.lastName}</h2>
                      <p style={{ color: '#666', marginTop: '0.5rem' }}>@{user?.username}</p>
                      <p style={{ color: '#666' }}>{user?.email}</p>
                      
                      {user?.bio && (
                        <div style={{ marginTop: '1rem' }}>
                          <h3>Bio</h3>
                          <p>{user.bio}</p>
                        </div>
                      )}

                      <div style={{ marginTop: '1rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                        <p><strong>Role:</strong> {user?.role || 'USER'}</p>
                        <p><strong>Member since:</strong> {new Date(user?.createdAt).toLocaleDateString()}</p>
                        <p><strong>Posts:</strong> {user?.postCount || 0}</p>
                        <p><strong>Following:</strong> {followCounts.following || 0}</p>
                        <p><strong>Followers:</strong> {followCounts.followers || 0}</p>
                      </div>
                    </>
                  ) : (
                    <form onSubmit={handleSave}>
                      <div className="form-group">
                        <label className="form-label">Username (cannot be changed)</label>
                        <input
                          type="text"
                          value={user?.username || ''}
                          disabled
                          className="form-input"
                          style={{ background: '#f5f5f5', cursor: 'not-allowed' }}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Email *</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="form-input"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">New Password (leave blank to keep current)</label>
                        <div className="password-input-wrapper">
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="Enter new password"
                          />
                          <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? (
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                <line x1="1" y1="1" x2="23" y2="23"></line>
                              </svg>
                            ) : (
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>

                      {formData.password && (
                        <div className="form-group">
                          <label className="form-label">Confirm Password</label>
                          <div className="password-input-wrapper">
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleInputChange}
                              className="form-input"
                              placeholder="Confirm new password"
                            />
                            <button
                              type="button"
                              className="password-toggle"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                            >
                              {showConfirmPassword ? (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                  <line x1="1" y1="1" x2="23" y2="23"></line>
                                </svg>
                              ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                  <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="form-group">
                        <label className="form-label">First Name</label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Last Name</label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Bio</label>
                        <textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          className="form-input"
                          rows="4"
                          placeholder="Tell us about yourself..."
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                        <button type="submit" className="btn btn-primary">
                          Save Changes
                        </button>
                        <button type="button" onClick={handleCancel} className="btn btn-secondary">
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default UserProfile;




