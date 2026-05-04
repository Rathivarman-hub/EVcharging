import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Form, Badge } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import { User, Mail, Shield, Calendar, MapPin, Edit2, Save, X } from 'lucide-react';
import { motion } from 'framer-motion';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const { user, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [stats, setStats] = useState({ totalBookings: 0, activeBookings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name, email: user.email });
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/bookings/my-bookings');
      setStats({
        totalBookings: data.length,
        activeBookings: data.filter(b => b.status === 'confirmed').length
      });
    } catch (error) {
      console.error('Error fetching stats', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateUserProfile(formData);
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h1 className="fw-bold text-white mb-1">Hello, {user?.name}!</h1>
          <p className="text-muted">Welcome back to your charging dashboard.</p>
        </div>
      </div>

      <Row className="g-4">
        <Col lg={4}>
          <Card className="glass-card h-100 overflow-hidden">
            <div className="bg-primary bg-opacity-20 p-4 text-center border-bottom border-white border-opacity-10">
              <div className="bg-primary rounded-circle p-3 d-inline-block mb-3 shadow-lg">
                <User size={48} color="white" />
              </div>
              <h4 className="text-white fw-bold mb-1">{user?.name}</h4>
              <Badge bg="primary" className="px-3 py-2 rounded-pill text-uppercase" style={{ fontSize: '0.6rem', letterSpacing: '1px' }}>
                {user?.role}
              </Badge>
            </div>
            
            <Card.Body className="p-4">
              {!isEditing ? (
                <div className="d-flex flex-column gap-3">
                  <div className="d-flex align-items-center gap-3 text-muted">
                    <Mail size={18} className="text-primary" />
                    <span>{user?.email}</span>
                  </div>
                  <div className="d-flex align-items-center gap-3 text-muted">
                    <Shield size={18} className="text-primary" />
                    <span>Account Verified</span>
                  </div>
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    className="mt-3 d-flex align-items-center justify-content-center gap-2"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 size={14} /> Edit Profile
                  </Button>
                </div>
              ) : (
                <Form onSubmit={handleUpdate}>
                  <Form.Group className="mb-3">
                    <Form.Label className="text-muted small fw-bold">NAME</Form.Label>
                    <Form.Control 
                      type="text" 
                      className="bg-transparent text-white" 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="text-muted small fw-bold">EMAIL</Form.Label>
                    <Form.Control 
                      type="email" 
                      className="bg-transparent text-white" 
                      value={formData.email}
                      disabled
                    />
                  </Form.Group>
                  <div className="d-flex gap-2 mt-4">
                    <Button variant="primary" size="sm" type="submit" className="flex-grow-1 d-flex align-items-center justify-content-center gap-2">
                      <Save size={14} /> Save
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => setIsEditing(false)}>
                      <X size={14} />
                    </Button>
                  </div>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Row className="g-4 mb-4">
            <Col md={6}>
              <Card className="glass-card p-4 border-start border-4 border-primary">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-primary bg-opacity-10 p-3 rounded-3">
                    <Calendar size={24} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="text-white fw-bold mb-0">{stats.totalBookings}</h2>
                    <p className="text-muted small mb-0">Total Bookings</p>
                  </div>
                </div>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="glass-card p-4 border-start border-4 border-accent">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-accent bg-opacity-10 p-3 rounded-3">
                    <MapPin size={24} color="#10b981" />
                  </div>
                  <div>
                    <h2 className="text-white fw-bold mb-0">{stats.activeBookings}</h2>
                    <p className="text-muted small mb-0">Active Slots</p>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          <Card className="glass-card h-100">
            <Card.Header className="bg-transparent border-white border-opacity-10 p-4 d-flex justify-content-between align-items-center">
              <h5 className="text-white fw-bold mb-0">Recent Activity</h5>
              <Button variant="link" className="text-primary p-0 text-decoration-none small">View All</Button>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="p-5 text-center text-muted">
                <p>No recent activity found. Start booking charging slots to see them here!</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
