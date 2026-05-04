import React, { useState, useEffect } from 'react';
import { Row, Col, Form, InputGroup, Button } from 'react-bootstrap';
import api from '../services/api';
import StationCard from '../components/StationCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Search, MapPin, SlidersHorizontal } from 'lucide-react';
import { toast } from 'react-toastify';

const Stations = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState(null);
  const [radius, setRadius] = useState(10000); // 10km

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocation(coords);
          fetchStations(coords);
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.warn("Using default location. Enable GPS for nearby stations.");
          fetchStations();
        }
      );
    } else {
      fetchStations();
    }
  };

  const fetchStations = async (coords = location) => {
    setLoading(true);
    try {
      let url = '/stations';
      if (coords) {
        url += `?lat=${coords.lat}&lng=${coords.lng}&maxDistance=${radius}`;
      }
      const { data } = await api.get(url);
      setStations(data);
    } catch (error) {
      toast.error('Failed to load stations');
    } finally {
      setLoading(false);
    }
  };

  const filteredStations = stations.filter(station => 
    station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    station.location.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fade-in">
      <div className="mb-4">
        <h1 className="fw-bold text-white mb-1">Charging Stations</h1>
        <p className="text-muted">
          {filteredStations.length} EV charging station{filteredStations.length !== 1 ? 's' : ''} available 
          {searchTerm ? ` in "${searchTerm}"` : ' near you'}.
        </p>
      </div>


      <Row className="g-3 mb-4">
        <Col md={6} lg={8}>
          <InputGroup className="glass-card border-0">
            <InputGroup.Text className="bg-transparent border-0 text-muted ps-3">
              <Search size={20} />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search by cityname or address..."
              className="bg-transparent text-white border-0 py-3"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={3} lg={2}>
          <Button 
            variant="outline-primary" 
            className="w-100 h-100 py-3 d-flex align-items-center justify-content-center gap-2 border-white border-opacity-10 text-white"
            onClick={getUserLocation}
          >
            <MapPin size={20} /> Near Me
          </Button>
        </Col>
        <Col md={3} lg={2}>
          <Form.Select 
            className="w-100 h-100 py-3 bg-dark border-white border-opacity-10 text-white"
            value={radius}
            onChange={(e) => {
              setRadius(e.target.value);
              if(location) fetchStations(location);
            }}
          >
            <option value="5000">5 KM</option>
            <option value="10000">10 KM</option>
            <option value="20000">20 KM</option>
            <option value="50000">50 KM</option>
          </Form.Select>
        </Col>
      </Row>

      {loading ? (
        <LoadingSpinner />
      ) : filteredStations.length > 0 ? (
        <Row className="g-4">
          {filteredStations.map((station) => (
            <Col key={station._id} sm={6} lg={4} xl={3}>
              <StationCard station={station} userLocation={location} />
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
    </div>
  );
};

export default Stations;
