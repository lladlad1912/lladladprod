import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { getAllSettings, getPosts, getCategories } from '../services/api';
import { SITEMAP_XML_URL } from '../config';
import { categoryPath, postPath } from '../utils/urls';
import '../App.css';

function Footer() {
  const [settings, setSettings] = useState({});
  const [latestPosts, setLatestPosts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await getAllSettings();
        setSettings(response.data);
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    };
    
    const loadLatestPosts = async () => {
      try {
        const response = await getPosts();
        const posts = response.data.content || response.data || [];
        setLatestPosts(posts.slice(0, 5));
      } catch (err) {
        console.error('Failed to load latest posts:', err);
      }
    };

    const loadCategories = async () => {
      try {
        const response = await getCategories();
        setCategories(response.data || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    
    loadSettings();
    loadLatestPosts();
    loadCategories();
  }, []);

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <Logo size={32} />
              <span>lladlad</span>
            </div>
            <p className="footer-description">
              {settings.footer_description || "Your destination for insightful articles, engaging stories, and thought-provoking content."}
            </p>
          </div>

          <div className="footer-section">
            <h4>Latest Posts</h4>
            <ul className="footer-links">
              {latestPosts.length > 0 ? (
                latestPosts.map((post) => (
                  <li key={post.id}>
                    <Link to={postPath(post)}>{post.title}</Link>
                  </li>
                ))
              ) : (
                <li>No posts yet</li>
              )}
            </ul>
          </div>

          <div className="footer-section">
            <h4>Explore</h4>
            <ul className="footer-links">
              <li><Link to="/sitemap">Sitemap</Link></li>
              <li>
                <a href={SITEMAP_XML_URL} target="_blank" rel="noopener noreferrer">
                  XML sitemap
                </a>
              </li>
              {categories.map((category) => (
                <li key={category.id}>
                  <Link to={categoryPath(category)}>{category.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-section">
            <h4>Reach Out</h4>
            <div className="footer-contact">
              <p>Have questions or feedback?</p>
              <p>We'd love to hear from you!</p>
              <div className="footer-social">
                <a
                  href={`mailto:${settings.contact_email || 'contact@lladlad.com'}`}
                  className="social-link"
                  aria-label="Email"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <span>Email</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} lladlad. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
