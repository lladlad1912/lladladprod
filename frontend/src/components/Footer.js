import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { FacebookIcon, InstagramIcon, TwitterIcon } from './SocialIcons';
import { getAllSettings, getPosts } from '../services/api';
import '../App.css';

function Footer() {
  const [settings, setSettings] = useState({});
  const [latestPosts, setLatestPosts] = useState([]);

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
        // Get latest 5 posts
        setLatestPosts(posts.slice(0, 5));
      } catch (err) {
        console.error('Failed to load latest posts:', err);
      }
    };
    
    loadSettings();
    loadLatestPosts();
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
                    <Link to={`/posts/${post.id}`}>{post.title}</Link>
                  </li>
                ))
              ) : (
                <li>No posts yet</li>
              )}
            </ul>
          </div>

          <div className="footer-section">
            <h4>Reach Out</h4>
            <div className="footer-contact">
              <p>Have questions or feedback?</p>
              <p>We'd love to hear from you!</p>
              <div className="footer-social">
                <a 
                  href={settings.social_facebook || "https://facebook.com/lladlad"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-link"
                  aria-label="Facebook"
                >
                  <FacebookIcon size={20} />
                  <span>Facebook</span>
                </a>
                <a 
                  href={settings.social_instagram || "https://instagram.com/lladlad"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-link"
                  aria-label="Instagram"
                >
                  <InstagramIcon size={20} />
                  <span>Instagram</span>
                </a>
                <a 
                  href={settings.social_twitter || "https://twitter.com/lladlad"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-link"
                  aria-label="Twitter"
                >
                  <TwitterIcon size={20} />
                  <span>Twitter</span>
                </a>
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



