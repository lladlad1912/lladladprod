import React from 'react';
import '../App.css';

function YouTubeEmbed({ embedUrl }) {
  if (!embedUrl) {
    return null;
  }

  return (
    <div style={{ margin: '1.5rem 0', maxWidth: '600px' }}>
      <iframe
        className="youtube-embed"
        src={embedUrl}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ maxWidth: '100%' }}
      />
    </div>
  );
}

export default YouTubeEmbed;



