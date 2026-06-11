import React, { useState } from 'react';
import { submitContact } from '../services/api';
import '../App.css';

function WriteForLladlad() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Write for lladlad',
    message: '',
    submissionType: 'write-for-lladlad'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await submitContact(formData);
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        subject: 'Write for lladlad',
        message: '',
        submissionType: 'write-for-lladlad'
      });
    } catch (err) {
      setError(err.response?.data || 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '3rem auto', padding: '0 1rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1>Write for lladlad</h1>
        <p style={{ color: '#666', fontSize: '1.1rem', lineHeight: '1.6' }}>
          We're always looking for talented writers to share their stories, insights, and perspectives. 
          If you have a passion for writing and want to contribute to lladlad, we'd love to hear from you!
        </p>
      </div>

      {success && (
        <div className="success" style={{ marginBottom: '2rem' }}>
          <strong>Thank you for your interest!</strong> We've received your submission and will get back to you soon.
        </div>
      )}

      {error && (
        <div className="error" style={{ marginBottom: '2rem' }}>
          {error}
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Your Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="form-input"
              required
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="form-input"
              required
              placeholder="your.email@example.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Subject</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Write for lladlad"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Your Message *</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              className="form-input"
              rows="8"
              required
              placeholder="Tell us about yourself, your writing experience, and what topics you'd like to write about..."
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '1rem' }}
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>

      <div style={{ marginTop: '3rem', padding: '2rem', background: '#f9fafb', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '1rem' }}>What We're Looking For</h3>
        <ul style={{ lineHeight: '1.8', color: '#666' }}>
          <li>Original, well-researched content</li>
          <li>Engaging writing style</li>
          <li>Topics that align with our categories: Movies, Tech, Dharma, Gaming</li>
          <li>Commitment to quality and authenticity</li>
        </ul>
      </div>
    </div>
  );
}

export default WriteForLladlad;


























