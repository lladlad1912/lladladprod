import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getActiveClients } from '../services/api';
import PageLayout from './PageLayout';
import SEO from './SEO';
import '../App.css';

const SERVICE_LABELS = {
  logistics: 'Logistics',
  'web-services': 'Web Services',
};

function ServicesPage() {
  const [clients, setClients] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClients();
  }, [categoryFilter]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const params = categoryFilter !== 'all' ? categoryFilter : undefined;
      const response = await getActiveClients(params);
      setClients(response.data || []);
    } catch (err) {
      console.error('Failed to load clients:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients;

  return (
    <>
      <SEO
        title="Services & Clients | lladlad"
        description="Logistics and web service solutions. See our client work and latest updates."
      />
      <PageLayout mainClassName="page-layout-main">
      <div className="services-page">
        <section className="services-hero">
          <h1>Services & Client Updates</h1>
          <p>
            Beyond publishing — we help businesses with logistics operations and modern web solutions.
            Partner with us to streamline supply chains or build digital products that scale.
          </p>
          <div className="services-hero-actions">
            <Link to="/services/inquiry" className="btn btn-primary">
              Request Services
            </Link>
            <Link to="/contact" className="btn btn-secondary">
              General Contact
            </Link>
          </div>
        </section>

        <div className="services-tabs">
          <button
            type="button"
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
          >
            Services
          </button>
          <button
            type="button"
            className={activeTab === 'clients' ? 'active' : ''}
            onClick={() => setActiveTab('clients')}
          >
            Clients & Updates
          </button>
        </div>

        {activeTab === 'overview' && (
          <section className="services-grid">
            <article className="card service-card">
              <div className="service-icon">🚚</div>
              <h2>Logistics</h2>
              <p>
                End-to-end logistics support — route planning, vendor coordination, inventory tracking,
                and operational consulting for businesses that move goods at scale.
              </p>
              <ul>
                <li>Supply chain & fulfillment consulting</li>
                <li>Last-mile and warehouse coordination</li>
                <li>Process optimization & reporting</li>
              </ul>
              <Link to="/services/inquiry?service=logistics" className="btn btn-primary">
                Discuss Logistics
              </Link>
            </article>

            <article className="card service-card">
              <div className="service-icon">💻</div>
              <h2>Web Services</h2>
              <p>
                Custom web applications, APIs, and full-stack development. From MVPs to production
                systems — built with the same stack powering lladlad.
              </p>
              <ul>
                <li>React & Spring Boot applications</li>
                <li>API design, integrations & dashboards</li>
                <li>Deployment, hosting & maintenance</li>
              </ul>
              <Link to="/services/inquiry?service=web-services" className="btn btn-primary">
                Discuss Web Project
              </Link>
            </article>
          </section>
        )}

        {activeTab === 'clients' && (
          <section className="clients-section">
            <div className="clients-filters">
              <button
                type="button"
                className={categoryFilter === 'all' ? 'active' : ''}
                onClick={() => setCategoryFilter('all')}
              >
                All
              </button>
              <button
                type="button"
                className={categoryFilter === 'logistics' ? 'active' : ''}
                onClick={() => setCategoryFilter('logistics')}
              >
                Logistics
              </button>
              <button
                type="button"
                className={categoryFilter === 'web-services' ? 'active' : ''}
                onClick={() => setCategoryFilter('web-services')}
              >
                Web Services
              </button>
            </div>

            {loading ? (
              <div className="loading">Loading clients...</div>
            ) : filteredClients.length === 0 ? (
              <div className="card clients-empty">
                <p>No client updates published yet. Check back soon.</p>
              </div>
            ) : (
              <div className="clients-grid">
                {filteredClients.map((client) => (
                  <article key={client.id} className="card client-card">
                    <div className="client-card-header">
                      {client.logoUrl ? (
                        <img src={client.logoUrl} alt={client.company || client.name} className="client-logo" />
                      ) : (
                        <div className="client-logo-placeholder">
                          {(client.company || client.name || '?').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h3>{client.name}</h3>
                        {client.company && <p className="client-company">{client.company}</p>}
                        <span className="client-category-badge">
                          {SERVICE_LABELS[client.serviceCategory] || client.serviceCategory}
                        </span>
                      </div>
                    </div>

                    {client.description && <p className="client-description">{client.description}</p>}

                    {(client.updateTitle || client.updateContent) && (
                      <div className="client-update">
                        <h4>{client.updateTitle || 'Latest Update'}</h4>
                        {client.updateContent && <p>{client.updateContent}</p>}
                        {client.updatedAt && (
                          <time className="client-update-date">
                            Updated {new Date(client.updatedAt).toLocaleDateString()}
                          </time>
                        )}
                      </div>
                    )}

                    {client.website && (
                      <a
                        href={client.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="client-website-link"
                      >
                        Visit website →
                      </a>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
      </PageLayout>
    </>
  );
}

export default ServicesPage;
