import React, { useState, useEffect } from 'react';
import { getAdsByPosition } from '../services/api';

function AdPlacement({ position }) {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAds = async () => {
      try {
        const response = await getAdsByPosition(position);
        setAds(response.data.filter(ad => ad.isActive));
      } catch (err) {
        console.error('Failed to load ads:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAds();
  }, [position]);

  if (loading || ads.length === 0) {
    return null;
  }

  return (
    <div className="ad-placement" data-position={position}>
      {ads.map((ad) => (
        <div
          key={ad.id}
          className="ad-container"
          style={{
            width: ad.width || '100%',
            height: ad.height || 'auto',
            margin: '1rem 0',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
          dangerouslySetInnerHTML={{ __html: ad.adCode }}
        />
      ))}
    </div>
  );
}

export default AdPlacement;


























