import React from 'react';
import Logo from './Logo';
import '../App.css';

function Footer() {
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
              Your destination for insightful articles, engaging stories, and thought-provoking content.
            </p>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><a href="/">Home</a></li>
              <li><a href="/categories">Categories</a></li>
              <li><a href="/posts/new">Create Post</a></li>
              <li><a href="/profile">Profile</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Reach Out</h4>
            <div className="footer-contact">
              <p>Have questions or feedback?</p>
              <p>We'd love to hear from you!</p>
              <div className="footer-social">
                <a 
                  href="https://facebook.com/lladlad" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-link"
                  aria-label="Facebook"
                >
                  📘 Facebook
                </a>
                <a 
                  href="https://instagram.com/lladlad" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-link"
                  aria-label="Instagram"
                >
                  📷 Instagram
                </a>
                <a 
                  href="mailto:contact@lladlad.com" 
                  className="social-link"
                  aria-label="Email"
                >
                  ✉️ Email
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


