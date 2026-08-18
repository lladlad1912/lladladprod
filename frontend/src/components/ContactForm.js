import React, { useState } from 'react';
import { submitContact } from '../services/api';
import '../App.css';

function ContactForm({
  title,
  description,
  submissionType,
  defaultSubject,
  submitLabel = 'Send Message',
  showCompany = false,
  showPhone = false,
  showServiceType = false,
  messagePlaceholder = 'Your message...',
  extraInfo = null,
  initialServiceType = 'logistics',
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: defaultSubject || '',
    message: '',
    submissionType,
    company: '',
    phone: '',
    serviceType: initialServiceType,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => ({
    name: '',
    email: '',
    subject: defaultSubject || '',
    message: '',
    submissionType,
    company: '',
    phone: '',
    serviceType: initialServiceType,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        subject: formData.subject || defaultSubject,
        message: formData.message,
        submissionType,
      };
      if (showCompany && formData.company) payload.company = formData.company;
      if (showPhone && formData.phone) payload.phone = formData.phone;
      if (showServiceType) payload.serviceType = formData.serviceType;

      await submitContact(payload);
      setSuccess(true);
      setFormData(resetForm());
    } catch (err) {
      setError(err.response?.data || 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-form-page">
      {(title || description) && (
        <div className="contact-form-header">
          {title && <h1>{title}</h1>}
          {description && <p>{description}</p>}
        </div>
      )}

      {success && (
        <div className="success contact-form-alert">
          <strong>Thank you!</strong> We received your message and will get back to you soon.
        </div>
      )}

      {error && <div className="error contact-form-alert">{error}</div>}

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
              placeholder="Full name"
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
              placeholder="you@company.com"
            />
          </div>

          {showCompany && (
            <div className="form-group">
              <label className="form-label">Company</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Company name"
              />
            </div>
          )}

          {showPhone && (
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="form-input"
                placeholder="+91 ..."
              />
            </div>
          )}

          {showServiceType && (
            <div className="form-group">
              <label className="form-label">Service Needed *</label>
              <select
                name="serviceType"
                value={formData.serviceType}
                onChange={handleInputChange}
                className="form-input"
                required
              >
                <option value="logistics">Logistics</option>
                <option value="web-services">Web Services</option>
                <option value="other">Other</option>
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Subject</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              className="form-input"
              placeholder={defaultSubject || 'Subject'}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Message *</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              className="form-input"
              rows="8"
              required
              placeholder={messagePlaceholder}
            />
          </div>

          <button type="submit" className="btn btn-primary contact-form-submit" disabled={loading}>
            {loading ? 'Sending...' : submitLabel}
          </button>
        </form>
      </div>

      {extraInfo}
    </div>
  );
}

export default ContactForm;
