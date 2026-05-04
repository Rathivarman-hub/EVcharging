import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Badge, Button, Modal } from 'react-bootstrap';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { Calendar, Clock, MapPin, Zap, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data } = await api.get('/bookings/my-bookings');
      setBookings(data);
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedBooking) return;
    try {
      await api.delete(`/bookings/${selectedBooking._id}`);
      toast.success('Booking cancelled successfully');
      fetchBookings();
      setShowCancelModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed': return <Badge bg="accent" style={{ backgroundColor: '#10b981' }}>Confirmed</Badge>;
      case 'cancelled': return <Badge bg="danger">Cancelled</Badge>;
      case 'completed': return <Badge bg="primary">Completed</Badge>;
      default: return <Badge bg="secondary">{status}</Badge>;
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="fade-in">
      <div className="mb-4">
        <h1 className="fw-bold text-white mb-1">My Bookings</h1>
        <p className="text-muted">Manage your upcoming and past charging sessions.</p>
      </div>

      {bookings.length > 0 ? (
        <Row className="g-4">
          {bookings.map((booking, index) => (
            <Col key={booking._id} lg={6}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-card overflow-hidden h-100">
                  <Card.Body className="p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-primary bg-opacity-10 p-3 rounded-3">
                          <Zap size={24} className="text-primary" />
                        </div>
                        <div>
                          <h5 className="text-white fw-bold mb-0">{booking.station?.name}</h5>
                          <div className="text-muted small d-flex align-items-center gap-1">
                            <MapPin size={12} /> {booking.station?.location?.address}
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>

                    <div className="row g-3 py-3 border-top border-bottom border-white border-opacity-10 my-3">
                      <div className="col-6">
                        <div className="text-muted small mb-1 d-flex align-items-center gap-1">
                          <Calendar size={14} /> Date
                        </div>
                        <div className="text-white fw-medium">
                          {new Date(booking.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="text-muted small mb-1 d-flex align-items-center gap-1">
                          <Clock size={14} /> Slot Time
                        </div>
                        <div className="text-white fw-medium">
                          {booking.slot?.time}
                        </div>
                      </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center">
                      <div className="small text-muted">
                        Booked on: {new Date(booking.createdAt).toLocaleDateString()}
                      </div>
                      {booking.status === 'confirmed' && (
                        <Button 
                          variant="outline-danger" 
                          size="sm" 
                          className="d-flex align-items-center gap-2"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowCancelModal(true);
                          }}
                        >
                          <Trash2 size={14} /> Cancel
                        </Button>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      ) : (
        <div className="text-center p-5 glass-card mt-4">
          <div className="text-muted mb-3">
            <Calendar size={48} strokeWidth={1} />
          </div>
          <h4 className="text-white">No Bookings Yet</h4>
          <p className="text-muted">You haven't made any charging reservations yet.</p>
          <Button as={import('react-router-dom').Link} to="/stations" variant="primary" className="mt-2">Find a Station</Button>
        </div>
      )}

      {/* Cancel Modal */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} centered contentClassName="glass-card border-0">
        <Modal.Body className="p-4 text-center">
          <div className="text-danger mb-3">
            <XCircle size={48} />
          </div>
          <h4 className="text-white fw-bold mb-2">Cancel Booking?</h4>
          <p className="text-muted">Are you sure you want to cancel your slot at <strong>{selectedBooking?.station?.name}</strong>?</p>
          <div className="d-flex gap-2 mt-4">
            <Button variant="outline-light" className="flex-grow-1" onClick={() => setShowCancelModal(false)}>No, Keep it</Button>
            <Button variant="danger" className="flex-grow-1" onClick={handleCancel}>Yes, Cancel</Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Bookings;
