import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Modal, Form, Row, Col, Badge } from 'react-bootstrap';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { Plus, Edit, Trash2, MapPin, Zap, ExternalLink } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminStations = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentStation, setCurrentStation] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    lat: '',
    lng: '',
    totalSlots: 4,
    isActive: true
  });

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      const { data } = await api.get('/stations');
      setStations(data);
    } catch (error) {
      toast.error('Failed to load stations');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const stationData = {
        name: formData.name,
        location: {
          type: 'Point',
          coordinates: [parseFloat(formData.lng), parseFloat(formData.lat)],
          address: formData.address
        },
        totalSlots: parseInt(formData.totalSlots),
        isActive: formData.isActive
      };

      if (currentStation) {
        await api.put(`/stations/${currentStation._id}`, stationData);
        toast.success('Station updated successfully');
      } else {
        await api.post('/stations', stationData);
        toast.success('Station created successfully');
      }
      fetchStations();
      handleClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this station?')) {
      try {
        await api.delete(`/stations/${id}`);
        toast.success('Station deleted successfully');
        fetchStations();
      } catch (error) {
        toast.error('Failed to delete station');
      }
    }
  };

  const handleEdit = (station) => {
    setCurrentStation(station);
    setFormData({
      name: station.name,
      address: station.location.address,
      lat: station.location.coordinates[1],
      lng: station.location.coordinates[0],
      totalSlots: station.totalSlots,
      isActive: station.isActive
    });
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setCurrentStation(null);
    setFormData({
      name: '',
      address: '',
      lat: '',
      lng: '',
      totalSlots: 4,
      isActive: true
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold text-white mb-1">Manage Stations</h1>
          <p className="text-muted">Configure and monitor charging locations.</p>
        </div>
        <Button variant="primary" className="d-flex align-items-center gap-2" onClick={() => setShowModal(true)}>
          <Plus size={20} /> Add Station
        </Button>
      </div>

      <Card className="glass-card overflow-hidden">
        <div className="table-responsive">
          <Table variant="dark" hover className="mb-0 bg-transparent align-middle">
            <thead className="bg-white bg-opacity-5">
              <tr>
                <th className="py-3 ps-4 text-muted small fw-bold">STATION NAME</th>
                <th className="py-3 text-muted small fw-bold">LOCATION</th>
                <th className="py-3 text-muted small fw-bold text-center">SLOTS</th>
                <th className="py-3 text-muted small fw-bold text-center">STATUS</th>
                <th className="py-3 pe-4 text-muted small fw-bold text-end">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {stations.map((station) => (
                <tr key={station._id} className="border-white border-opacity-5">
                  <td className="bg-transparent py-3 ps-4">
                    <div className="text-white fw-bold">{station.name}</div>
                    <div className="text-muted small">ID: {station._id.substring(0, 8)}...</div>
                  </td>
                  <td className="bg-transparent py-3 text-muted small">
                    <div className="d-flex align-items-center gap-2">
                      <MapPin size={14} className="text-primary" />
                      {station.location.address}
                    </div>
                  </td>
                  <td className="bg-transparent py-3 text-center">
                    <Badge bg="info" className="bg-opacity-10 text-info border border-info border-opacity-20 px-3 py-2">
                      <Zap size={12} className="me-1" /> {station.slots?.length || 0} / {station.totalSlots}
                    </Badge>
                  </td>
                  <td className="bg-transparent py-3 text-center">
                    {station.isActive ? (
                      <Badge bg="success" className="bg-opacity-10 text-success border border-success border-opacity-20 px-3 py-2">Online</Badge>
                    ) : (
                      <Badge bg="danger" className="bg-opacity-10 text-danger border border-danger border-opacity-20 px-3 py-2">Offline</Badge>
                    )}
                  </td>
                  <td className="bg-transparent py-3 pe-4 text-end">
                    <div className="d-flex gap-2 justify-content-end">
                      <Button variant="outline-light" size="sm" onClick={() => handleEdit(station)}>
                        <Edit size={14} />
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={() => handleDelete(station._id)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card>

      {/* Station Modal */}
      <Modal show={showModal} onHide={handleClose} centered size="lg" contentClassName="glass-card border-0">
        <Modal.Header closeButton closeVariant="white" className="border-white border-opacity-10 px-4">
          <Modal.Title className="text-white fw-bold">
            {currentStation ? 'Edit Station' : 'Add New Station'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-muted small fw-bold">STATION NAME</Form.Label>
                  <Form.Control
                    type="text"
                    className="bg-transparent text-white border-white border-opacity-20"
                    placeholder="e.g. GreenCharge Hub Central"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-muted small fw-bold">ADDRESS</Form.Label>
                  <Form.Control
                    type="text"
                    className="bg-transparent text-white border-white border-opacity-20"
                    placeholder="Street name, City"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-muted small fw-bold">LATITUDE</Form.Label>
                  <Form.Control
                    type="number"
                    step="any"
                    className="bg-transparent text-white border-white border-opacity-20"
                    value={formData.lat}
                    onChange={(e) => setFormData({...formData, lat: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-muted small fw-bold">LONGITUDE</Form.Label>
                  <Form.Control
                    type="number"
                    step="any"
                    className="bg-transparent text-white border-white border-opacity-20"
                    value={formData.lng}
                    onChange={(e) => setFormData({...formData, lng: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-muted small fw-bold">TOTAL SLOT CAPACITY</Form.Label>
                  <Form.Control
                    type="number"
                    className="bg-transparent text-white border-white border-opacity-20"
                    value={formData.totalSlots}
                    onChange={(e) => setFormData({...formData, totalSlots: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button variant="outline-light" onClick={handleClose}>Cancel</Button>
              <Button variant="primary" type="submit">
                {currentStation ? 'Update Station' : 'Create Station'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AdminStations;
