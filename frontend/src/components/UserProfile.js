import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, uploadImage } from '../services/api';
import '../App.css';

function UserProfile() {
  const { user: authUser, loadCurrentUser } = useAuth();
  const [user, setUser] = useState(authUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await getUserProfile();
      setUser(response.data);
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const response = await uploadImage(file);
      setSuccess('Profile image updated successfully');
      loadCurrentUser(); // Refresh user data
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to upload image');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div>
      <h1>My Profile</h1>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="card">
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
          <div>
            {user?.profileImage ? (
              <img 
                src={`http://localhost:8080${user.profileImage}`} 
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
                fontSize: '3rem'
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

          <div style={{ flex: 1 }}>
            <h2>{user?.firstName || user?.username} {user?.lastName}</h2>
            <p style={{ color: '#666', marginTop: '0.5rem' }}>@{user?.username}</p>
            <p style={{ color: '#666' }}>{user?.email}</p>
            
            {user?.bio && (
              <div style={{ marginTop: '1rem' }}>
                <h3>Bio</h3>
                <p>{user.bio}</p>
              </div>
            )}

            <div style={{ marginTop: '1rem' }}>
              <p><strong>Role:</strong> {user?.role || 'USER'}</p>
              <p><strong>Member since:</strong> {new Date(user?.createdAt).toLocaleDateString()}</p>
              <p><strong>Posts:</strong> {user?.postCount || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;



