import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import SlotSelector from '../components/SlotSelector';
import LoadingSpinner from '../components/LoadingSpinner';
import { MapPin, Zap, ChevronLeft, Clock, Info } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const StationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, socket } = useAuth();
  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchStationDetails();

    if (socket) {
      socket.on('slotUpdated', (data) => {
        if (data.stationId === id) {
          fetchStationDetails(false);
        }
      });
      return () => socket.off('slotUpdated');
    }
  }, [id, socket]);

  const fetchStationDetails = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const { data } = await api.get(`/stations/${id}`);
      setStation(data);
    } catch (error) {
      toast.error('Failed to load station details');
      navigate('/stations');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedSlot) return;
    
    setBookingLoading(true);
    try {
      await api.post('/bookings', {
        stationId: id,
        slotId: selectedSlot._id,
        date: new Date().toISOString()
      });
      toast.success('Slot booked successfully!');
      navigate('/bookings');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="fade-in">
      <Button 
        variant="link" 
        className="text-muted p-0 text-decoration-none d-flex align-items-center gap-1 mb-4"
        onClick={() => navigate(-1)}
      >
        <ChevronLeft size={16} /> Back to Stations
      </Button>

      <Row className="g-4">
        <Col lg={4}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="glass-card overflow-hidden sticky-top" style={{ top: '80px' }}>
              <Card.Img 
                variant="top" 
                src={`https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&q=80`} 
                style={{ height: '240px', objectFit: 'cover' }}
              />
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h3 className="text-white fw-bold mb-0">{station?.name}</h3>
                  <Badge bg="primary">{station?.isActive ? 'Online' : 'Offline'}</Badge>
                </div>
                
                <p className="text-muted small d-flex align-items-start gap-2 mb-4">
                  <MapPin size={16} className="text-primary mt-1 flex-shrink-0" />
                  {station?.location?.address}
                </p>

                <div className="d-flex flex-column gap-3 py-3 border-top border-white border-opacity-10">
                  <div className="d-flex align-items-center gap-3">
                    <Zap size={20} className="text-primary" />
                    <div>
                      <div className="text-white fw-bold">{station?.totalSlots}</div>
                      <div className="text-muted small">Total Capacity</div>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <Clock size={20} className="text-primary" />
                    <div>
                      <div className="text-white fw-bold">24/7 Available</div>
                      <div className="text-muted small">Operating Hours</div>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <Info size={20} className="text-primary" />
                    <div>
                      <div className="text-white fw-bold">Type 2 / CCS2</div>
                      <div className="text-muted small">Connector Types</div>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>

        <Col lg={8}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="glass-card p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h4 className="text-white fw-bold mb-1">Available Time Slots</h4>
                  <p className="text-muted mb-0">Select a slot for today ({new Date().toLocaleDateString()})</p>
                </div>
                <Badge bg="accent" className="px-3 py-2 fs-6 shadow-sm" style={{ backgroundColor: '#10b981' }}>
                  {station?.slots?.filter(s => !s.isBooked).length || 0} Slots Free
                </Badge>
              </div>
              
              <SlotSelector 
                slots={station?.slots || []} 
                selectedSlot={selectedSlot} 
                onSelect={setSelectedSlot} 
              />

              <div className="mt-5 p-4 bg-primary bg-opacity-10 rounded-3 border border-primary border-opacity-20 d-flex flex-column flex-md-row justify-content-between align-items-center gap-4">
                <div>
                  <h5 className="text-white fw-bold mb-1">
                    {selectedSlot ? `Selected: ${selectedSlot.time}` : 'Select a slot to proceed'}
                  </h5>
                  <p className="text-muted small mb-0">Booking is subject to 15-minute grace period.</p>
                </div>
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="px-5 py-3 fw-bold shadow"
                  disabled={!selectedSlot || bookingLoading}
                  onClick={handleBooking}
                >
                  {bookingLoading ? 'Processing...' : 'Confirm Booking'}
                </Button>
              </div>
            </Card>
          </motion.div>
        </Col>
      </Row>
    </div>
  );
};

export default StationDetails;
