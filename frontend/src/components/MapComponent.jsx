import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Navigation, MapPin, ExternalLink, Loader } from 'lucide-react';

const MAP_LIBRARIES = ['places'];

const mapStyles = [
  { elementType: 'geometry', stylers: [{ color: '#1a1f2e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0d1117' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8892b0' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#ccd6f6' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8892b0' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#162032' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#253045' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1a2540' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#1e3a5f' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0f2140' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#1a2540' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0a1628' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#4a6fa5' }],
  },
];

const MapComponent = ({ stations, coordinates, stationName, stationAddress, height = '260px' }) => {
  const [infoOpen, setInfoOpen] = useState(null); // Now stores the station ID
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const mapRef = useRef(null);

  // If stations array is provided, use it; otherwise, use the single station props
  const mapStations = stations || (coordinates ? [{
    _id: 'single',
    name: stationName,
    location: { coordinates, address: stationAddress }
  }] : []);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: MAP_LIBRARIES,
  });

  const onLoad = useCallback((map) => {
    mapRef.current = map;
    if (mapStations.length > 1) {
      const bounds = new window.google.maps.LatLngBounds();
      mapStations.forEach(s => {
        if (s.location?.coordinates) {
          bounds.extend({ lat: s.location.coordinates[1], lng: s.location.coordinates[0] });
        }
      });
      map.fitBounds(bounds);
    }
  }, [mapStations]);

  const handleGetDirections = (station) => {
    if (!station?.location?.coordinates) return;
    const [lng, lat] = station.location.coordinates;
    setLocating(true);

    const openDirections = (originLat, originLng) => {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${lat},${lng}&travelmode=driving`;
      window.open(url, '_blank', 'noopener,noreferrer');
      setLocating(false);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          openDirections(latitude, longitude);
        },
        () => {
          const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
          window.open(url, '_blank', 'noopener,noreferrer');
          setLocating(false);
        }
      );
    } else {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
      window.open(url, '_blank', 'noopener,noreferrer');
      setLocating(false);
    }
  };

  const handleViewOnMaps = (station) => {
    if (!station?.location?.coordinates) return;
    const [lng, lat] = station.location.coordinates;
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loadError) {
    return (
      <div className="map-error-container d-flex flex-column align-items-center justify-content-center p-4 rounded-3"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', minHeight: '220px' }}>
        <MapPin size={32} className="text-danger mb-2" />
        <p className="text-white fw-semibold mb-1">Map failed to load</p>
        <p className="text-muted small text-center mb-3">
          Check your Google Maps API key in <code>.env</code>
        </p>
        <button onClick={handleViewOnMaps} className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2">
          <ExternalLink size={14} /> View on Google Maps
        </button>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="d-flex align-items-center justify-content-center rounded-3"
        style={{ background: 'rgba(255,255,255,0.05)', minHeight: '220px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-2" role="status" style={{ width: '1.5rem', height: '1.5rem' }} />
          <p className="text-muted small mb-0">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="map-wrapper" style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
      {/* Map */}
      <GoogleMap
        mapContainerStyle={{ width: '100%', height }}
        center={mapStations.length === 1 ? { lat: mapStations[0].location.coordinates[1], lng: mapStations[0].location.coordinates[0] } : { lat: 20.5937, lng: 78.9629 }}
        zoom={mapStations.length === 1 ? 15 : 5}
        options={{
          styles: mapStyles,
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        }}
        onLoad={onLoad}
      >
        {mapStations.map(station => (
          station.location?.coordinates && (
            <React.Fragment key={station._id}>
              <Marker
                position={{ lat: station.location.coordinates[1], lng: station.location.coordinates[0] }}
                onClick={() => setInfoOpen(station._id)}
                icon={{
                  url:
                    'data:image/svg+xml;charset=UTF-8,' +
                    encodeURIComponent(`
                      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="48" viewBox="0 0 36 48">
                        <ellipse cx="18" cy="46" rx="8" ry="3" fill="rgba(0,0,0,0.3)"/>
                        <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 30 18 30S36 31.5 36 18C36 8.06 27.94 0 18 0z" fill="#6366f1"/>
                        <circle cx="18" cy="18" r="10" fill="white" opacity="0.15"/>
                        <text x="18" y="23" text-anchor="middle" font-size="14" fill="white">⚡</text>
                      </svg>
                    `),
                  scaledSize: { width: 36, height: 48 },
                  anchor: { x: 18, y: 48 },
                }}
              />

              {infoOpen === station._id && (
                <InfoWindow
                  position={{ lat: station.location.coordinates[1], lng: station.location.coordinates[0] }}
                  onCloseClick={() => setInfoOpen(null)}
                >
                  <div style={{ maxWidth: '200px', fontFamily: 'Inter, sans-serif' }}>
                    <p style={{ fontWeight: 700, margin: '0 0 4px', color: '#1a1f2e', fontSize: '14px' }}>
                      ⚡ {station.name}
                    </p>
                    <p style={{ margin: '0 0 8px', color: '#555', fontSize: '12px' }}>
                      {station.location.address}
                    </p>
                    <button
                      onClick={() => handleGetDirections(station)}
                      style={{
                        background: '#6366f1',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '5px 10px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      🧭 Get Directions
                    </button>
                  </div>
                </InfoWindow>
              )}
            </React.Fragment>
          )
        ))}
      </GoogleMap>

      {/* Action Bar below the map (only for single station view) */}
      {mapStations.length === 1 && (
        <div
          className="d-flex align-items-center justify-content-between px-3 py-2"
          style={{ background: 'rgba(255,255,255,0.04)', borderTop: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="d-flex align-items-center gap-2 text-muted small">
            <MapPin size={14} className="text-primary" />
            <span className="text-white" style={{ fontSize: '12px' }}>
              {mapStations[0].location.address || 'Location on map'}
            </span>
          </div>
          <div className="d-flex gap-2">
            <button
              onClick={() => handleViewOnMaps(mapStations[0])}
              className="btn btn-sm d-flex align-items-center gap-1"
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#ccd6f6',
                borderRadius: '8px',
                fontSize: '12px',
                padding: '4px 10px',
              }}
            >
              <ExternalLink size={13} />
              <span className="d-none d-sm-inline">View</span>
            </button>
            <button
              onClick={() => handleGetDirections(mapStations[0])}
              disabled={locating}
              className="btn btn-sm d-flex align-items-center gap-1"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                border: 'none',
                color: '#fff',
                borderRadius: '8px',
                fontSize: '12px',
                padding: '4px 12px',
                fontWeight: 600,
              }}
            >
              {locating ? <Loader size={13} className="spin-icon" /> : <Navigation size={13} />} Directions
            </button>
          </div>
        </div>
      )}
      {/* Spin animation */}
      <style>{`
        .spin-icon { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default MapComponent;
