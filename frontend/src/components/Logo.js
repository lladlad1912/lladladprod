import React from 'react';

function Logo({ size = 40 }) {
  // Using dark blue color (#1e3a8a) matching the logo description
  const logoColor = '#1e3a8a';
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', flexShrink: 0 }}
    >
      {/* Left vertical line (part of 'b') */}
      <rect x="12" y="18" width="10" height="64" fill={logoColor} rx="1" />
      
      {/* Left half of circle (completes 'b') */}
      <path
        d="M 22 32 Q 38 28, 38 50 Q 38 72, 22 68"
        fill={logoColor}
      />
      
      {/* Right vertical line (part of 'd') */}
      <rect x="62" y="18" width="10" height="64" fill={logoColor} rx="1" />
      
      {/* Right half of circle (completes 'd') */}
      <path
        d="M 62 32 Q 78 28, 78 50 Q 78 72, 62 68"
        fill={logoColor}
      />
      
      {/* Central white circle (negative space) - the key feature */}
      <circle cx="50" cy="50" r="16" fill="white" />
    </svg>
  );
}

export default Logo;
