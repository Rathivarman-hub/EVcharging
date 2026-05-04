import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { MapPin, Zap, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';

const StationCard = ({ station, userLocation }) => {
  const calculateDistance = () => {
    if (!userLocation || !station.location.coordinates) return null;
    
    // Haversine formula
    const R = 6371; // km
    const dLat = (station.location.coordinates[1] - userLocation.lat) * Math.PI / 180;
    const dLon = (station.location.coordinates[0] - userLocation.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(station.location.coordinates[1] * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c;
    
    return d.toFixed(1);
  };

  const distance = calculateDistance();

  return (
    <motion.div
      whileHover={{ translateY: -5 }}
      transition={{ duration: 0.3 }}
      className="h-100"
    >
      <Card className="glass-card h-100 border-0 shadow-sm">
        <div className="position-relative">
          <Card.Img 
            variant="top" 
            src={`https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=500&q=80`} 
            style={{ height: '160px', objectFit: 'cover' }}
            className="rounded-top"
          />
          <div className="position-absolute top-0 end-0 m-3">
            <Badge bg={station.isActive ? 'accent' : 'danger'} className="px-2 py-1 shadow-sm" style={{ backgroundColor: station.isActive ? '#10b981' : '#ef4444' }}>
              {station.isActive ? 'Online' : 'Offline'}
            </Badge>
          </div>
        </div>
        
        <Card.Body className="p-4 d-flex flex-column">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <Card.Title className="text-white fw-bold mb-0">{station.name}</Card.Title>
            {distance && (
              <span className="text-primary small fw-bold d-flex align-items-center gap-1">
                <Navigation size={12} fill="currentColor" /> {distance} km
              </span>
            )}
          </div>
          
          <div className="d-flex align-items-center gap-2 text-muted small mb-3">
            <MapPin size={14} className="flex-shrink-0" />
            <span className="text-truncate">{station.location.address}</span>
          </div>

          <div className="mt-auto pt-3 border-top border-white border-opacity-10 d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-1 text-white fw-bold">
              <Zap size={16} className="text-primary" />
              <span>
                {station.slots?.filter(s => !s.isBooked).length || 0} / {station.slots?.length || 0} Available
              </span>
            </div>
            <Button 
              as={Link} 
              to={`/stations/${station._id}`} 
              variant="primary" 
              size="sm" 
              className="rounded-pill px-4"
            >
              Book
            </Button>
          </div>
        </Card.Body>
      </Card>
    </motion.div>
  );
};

export default StationCard;
