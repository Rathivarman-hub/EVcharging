import React, { useState, useEffect } from 'react';
import { Row, Col, Form, InputGroup, Button } from 'react-bootstrap';
import api from '../services/api';
import StationCard from '../components/StationCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Search, MapPin, SlidersHorizontal, Map as MapIcon, List } from 'lucide-react';
import { toast } from 'react-toastify';
import MapComponent from '../components/MapComponent';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Stations = () => {
  const { socket } = useAuth();
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'

  useEffect(() => {
    fetchStations();
  }, []);

  // Real-time: re-fetch whenever admin adds/edits/deletes a station
  useEffect(() => {
    if (!socket) return;
    const handleStationUpdate = () => {
      fetchStations();
    };
    socket.on('station_updated', handleStationUpdate);
    socket.on('station_created', handleStationUpdate);
    socket.on('station_deleted', handleStationUpdate);
    return () => {
      socket.off('station_updated', handleStationUpdate);
      socket.off('station_created', handleStationUpdate);
      socket.off('station_deleted', handleStationUpdate);
    };
  }, [socket]);

  const fetchStations = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/stations');
      setStations(data);
    } catch (error) {
      toast.error('Failed to load stations');
    } finally {
      setLoading(false);
    }
  };

  const filteredStations = stations
    .filter(station => 
      (station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      station.location.address.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!showAvailableOnly || (station.slots?.filter(s => !s.isBooked).length > 0))
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'slots') {
        const aSlots = a.slots?.filter(s => !s.isBooked).length || 0;
        const bSlots = b.slots?.filter(s => !s.isBooked).length || 0;
        return bSlots - aSlots;
      }
      return 0;
    });

  return (
    <div className="fade-in">
      <div className="mb-4">
        <h1 className="fw-bold text-white mb-1">Charging Stations</h1>
        <p className="text-muted">
          {filteredStations.length} EV charging station{filteredStations.length !== 1 ? 's' : ''} found 
          {searchTerm ? ` matching "${searchTerm}"` : ' in our network'}.
        </p>
      </div>

      <Row className="g-3 mb-4">
        <Col md={6} lg={5}>
          <InputGroup className="glass-card border-0">
            <InputGroup.Text className="bg-transparent border-0 text-muted ps-3">
              <Search size={20} />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search by city or station name..."
              className="bg-transparent text-white border-0 py-3"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        
        <Col md={3} lg={3}>
          <div className="glass-card h-100 d-flex align-items-center px-3 border-white border-opacity-10">
            <Form.Check 
              type="switch"
              id="available-switch"
              label="Available Now"
              className="text-white small fw-bold"
              checked={showAvailableOnly}
              onChange={(e) => setShowAvailableOnly(e.target.checked)}
            />
          </div>
        </Col>

        <Col md={3} lg={4}>
          <InputGroup className="glass-card border-0">
            <InputGroup.Text className="bg-transparent border-0 text-muted ps-3">
              <SlidersHorizontal size={18} />
            </InputGroup.Text>
            <Form.Select 
              className="bg-transparent text-white border-0 py-3"
              style={{ cursor: 'pointer' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name" className="bg-dark">Sort by: Name</option>
              <option value="slots" className="bg-dark">Sort by: Availability</option>
            </Form.Select>
          </InputGroup>
        </Col>
      </Row>
      
      <div className="d-flex justify-content-end mb-3">
        <div className="glass-card p-1 d-flex gap-1" style={{ borderRadius: '10px' }}>
          <Button 
            variant={viewMode === 'list' ? 'primary' : 'link'} 
            className={`px-3 py-1 d-flex align-items-center gap-2 ${viewMode === 'list' ? 'text-white' : 'text-muted'}`}
            onClick={() => setViewMode('list')}
            style={{ borderRadius: '8px' }}
          >
            <List size={18} /> List
          </Button>
          <Button 
            variant={viewMode === 'map' ? 'primary' : 'link'} 
            className={`px-3 py-1 d-flex align-items-center gap-2 ${viewMode === 'map' ? 'text-white' : 'text-muted'}`}
            onClick={() => setViewMode('map')}
            style={{ borderRadius: '8px' }}
          >
            <MapIcon size={18} /> Map
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'map' ? (
          <motion.div
            key="map-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4"
          >
            <MapComponent 
              stations={filteredStations} 
              height="500px"
            />
          </motion.div>
        ) : (
          <motion.div
            key="list-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {loading ? (
              <LoadingSpinner />
            ) : filteredStations.length > 0 ? (
              <Row className="g-4">
                {filteredStations.map((station) => (
                  <Col key={station._id} sm={6} lg={4} xl={3}>
                    <StationCard station={station} />
                  </Col>
                ))}
              </Row>
            ) : (
              <div className="text-center p-5 glass-card mt-4">
                <div className="text-muted mb-3">
                  <Search size={48} strokeWidth={1} />
                </div>
                <h4 className="text-white">No Stations Found</h4>
                <p className="text-muted">Try adjusting your search filters or location.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Stations;
