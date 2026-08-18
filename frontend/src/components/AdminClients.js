import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { getAllClients, createClient, updateClient, deleteClient } from '../services/api';
import Sidebar from './Sidebar';
import '../App.css';

const EMPTY_FORM = {
  name: '',
  company: '',
  serviceCategory: 'logistics',
  description: '',
  website: '',
  logoUrl: '',
  updateTitle: '',
  updateContent: '',
  displayOrder: 0,
  isActive: true,
};

function AdminClients() {
  const { isAdmin } = useAuth();
  const { sidebarOpen, closeSidebar } = useSidebar();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    if (isAdmin()) loadClients();
  }, [isAdmin]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const response = await getAllClients();
      setClients(response.data);
    } catch (err) {
      setError('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const payload = {
        ...formData,
        displayOrder: parseInt(formData.displayOrder, 10) || 0,
      };
      if (editingClient) {
        await updateClient(editingClient.id, payload);
        setSuccess('Client updated');
      } else {
        await createClient(payload);
        setSuccess('Client added');
      }
      setShowForm(false);
      setEditingClient(null);
      setFormData(EMPTY_FORM);
      await loadClients();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data || 'Failed to save client');
    }
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setFormData({
      name: client.name || '',
      company: client.company || '',
      serviceCategory: client.serviceCategory || 'logistics',
      description: client.description || '',
      website: client.website || '',
      logoUrl: client.logoUrl || '',
      updateTitle: client.updateTitle || '',
      updateContent: client.updateContent || '',
      displayOrder: client.displayOrder || 0,
      isActive: client.isActive !== false,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this client?')) return;
    try {
      await deleteClient(id);
      setSuccess('Client deleted');
      await loadClients();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to delete client');
    }
  };

  if (!isAdmin()) {
    return <div className="error">Admin access required.</div>;
  }

  return (
    <>
      {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar} />}
      <div className="magazine-layout">
        <div className={`sidebar-wrapper ${sidebarOpen ? 'open' : ''}`}>
          <Sidebar onClose={closeSidebar} />
        </div>
        <div className={`magazine-main ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <div className="admin-page">
            <div className="admin-page-header">
              <h1>Manage Clients</h1>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setShowForm(true);
                  setEditingClient(null);
                  setFormData(EMPTY_FORM);
                }}
              >
                + Add Client
              </button>
            </div>

            {success && <div className="success">{success}</div>}
            {error && <div className="error">{error}</div>}

            {showForm && (
              <div className="card admin-form-card">
                <h2>{editingClient ? 'Edit Client' : 'Add Client'}</h2>
                <form onSubmit={handleSubmit}>
                  <div className="admin-form-grid">
                    <div className="form-group">
                      <label className="form-label">Contact Name *</label>
                      <input name="name" value={formData.name} onChange={handleInputChange} className="form-input" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Company</label>
                      <input name="company" value={formData.company} onChange={handleInputChange} className="form-input" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Service Category *</label>
                      <select name="serviceCategory" value={formData.serviceCategory} onChange={handleInputChange} className="form-input">
                        <option value="logistics">Logistics</option>
                        <option value="web-services">Web Services</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Website</label>
                      <input name="website" value={formData.website} onChange={handleInputChange} className="form-input" placeholder="https://..." />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Logo URL</label>
                      <input name="logoUrl" value={formData.logoUrl} onChange={handleInputChange} className="form-input" placeholder="https://..." />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Display Order</label>
                      <input name="displayOrder" type="number" value={formData.displayOrder} onChange={handleInputChange} className="form-input" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea name="description" value={formData.description} onChange={handleInputChange} className="form-input" rows="3" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Update Title</label>
                    <input name="updateTitle" value={formData.updateTitle} onChange={handleInputChange} className="form-input" placeholder="e.g. Q2 rollout complete" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Update Content</label>
                    <textarea name="updateContent" value={formData.updateContent} onChange={handleInputChange} className="form-input" rows="4" placeholder="Latest news about this client..." />
                  </div>
                  <label className="checkbox-label">
                    <input name="isActive" type="checkbox" checked={formData.isActive} onChange={handleInputChange} />
                    Show on public services page
                  </label>
                  <div className="admin-form-actions">
                    <button type="submit" className="btn btn-primary">{editingClient ? 'Save Changes' : 'Add Client'}</button>
                    <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setEditingClient(null); }}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {loading ? (
              <div className="loading">Loading clients...</div>
            ) : clients.length === 0 ? (
              <div className="card"><p>No clients yet. Add your first client above.</p></div>
            ) : (
              <div className="admin-list">
                {clients.map((client) => (
                  <div key={client.id} className="card admin-list-item">
                    <div className="admin-list-item-main">
                      <h3>{client.name}{client.company ? ` · ${client.company}` : ''}</h3>
                      <p className="admin-list-meta">
                        {client.serviceCategory} · Order {client.displayOrder ?? 0} · {client.isActive ? 'Visible' : 'Hidden'}
                      </p>
                      {client.updateTitle && <p><strong>{client.updateTitle}</strong></p>}
                    </div>
                    <div className="admin-list-actions">
                      <button type="button" className="btn btn-secondary" onClick={() => handleEdit(client)}>Edit</button>
                      <button type="button" className="btn btn-secondary" onClick={() => handleDelete(client.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminClients;
