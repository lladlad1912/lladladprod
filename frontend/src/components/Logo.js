import React from 'react';

function Logo({ size = 40, className = '' }) {
  // Logo image path - update this to point to your uploaded logo image
  // Options:
  // 1. If logo is in public folder: '/logo.jpg' or '/logo.png' or '/images/logo.jpg'
  // 2. If logo is uploaded via backend: 'http://localhost:8080/uploads/logo.jpg'
  const logoPath = '/logo.jpg'; // Logo image path
  
  return (
    <img
      src={logoPath}
      alt="lladlad logo"
      style={{
        width: size,
        height: size,
        display: 'block',
        flexShrink: 0,
        objectFit: 'contain'
      }}
      className={className}
      onError={(e) => {
        // Fallback if image not found - show a placeholder
        console.warn('Logo image not found at:', logoPath);
        e.target.style.display = 'none';
      }}
    />
  );
}

export default Logo;
