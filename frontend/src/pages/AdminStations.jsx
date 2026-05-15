import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Modal, Form, Row, Col, Badge } from 'react-bootstrap';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { Plus, Edit, Trash2, MapPin, Zap, ExternalLink, X, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const AdminStations = () => {
  const { socket } = useAuth();
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentStation, setCurrentStation] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    lat: '',
    lng: '',
    totalSlots: 24,
    isActive: true,
    slots: []
  });
  const [newSlot, setNewSlot] = useState('');

  useEffect(() => {
    fetchStations();
  }, []);

  // Real-time: auto-refresh when any admin changes stations
  useEffect(() => {
    if (!socket) return;
    const refresh = () => fetchStations();
    socket.on('station_created', refresh);
    socket.on('station_updated', refresh);
    socket.on('station_deleted', refresh);
    return () => {
      socket.off('station_created', refresh);
      socket.off('station_updated', refresh);
      socket.off('station_deleted', refresh);
    };
  }, [socket]);

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
        isActive: formData.isActive,
        slots: formData.slots
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
    // Ensure we extract the 'time' string from each slot object if populated, 
    // or keep as string if it's already a time string.
    const slotTimes = station.slots ? station.slots.map(s => {
      if (typeof s === 'string') return s;
      return s.time || '';
    }).filter(Boolean) : [];

    setFormData({
      name: station.name,
      address: station.location.address,
      lat: station.location.coordinates[1],
      lng: station.location.coordinates[0],
      totalSlots: station.totalSlots,
      isActive: station.isActive,
      slots: slotTimes
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
      totalSlots: 24,
      isActive: true,
      slots: []
    });
    setNewSlot('');
  };

  const sortSlots = (slotsArray) => {
    return [...slotsArray].sort((a, b) => {
      const getTimeValue = (timeStr) => {
        try {
          const [start] = timeStr.split(' - ');
          const [time, modifier] = start.split(' ');
          let [hours, minutes] = time.split(':').map(Number);
          if (modifier === 'PM' && hours < 12) hours += 12;
          if (modifier === 'AM' && hours === 12) hours = 0;
          return hours * 60 + minutes;
        } catch (e) {
          return 0;
        }
      };
      return getTimeValue(a) - getTimeValue(b);
    });
  };

  const addSlot = () => {
    const trimmedSlot = newSlot.trim();
    if (trimmedSlot) {
      setFormData(prev => {
        // Prevent duplicates
        if (prev.slots.includes(trimmedSlot)) {
          toast.info('This slot is already added');
          return prev;
        }
        
        const newSlots = sortSlots([...prev.slots, trimmedSlot]);
        const newTotalSlots = Math.max(parseInt(prev.totalSlots) || 0, newSlots.length);
        
        return { 
          ...prev, 
          slots: newSlots,
          totalSlots: newTotalSlots
        };
      });
      setNewSlot('');
    }
  };

  const removeSlot = (index) => {
    const newSlots = [...formData.slots];
    newSlots.splice(index, 1);
    setFormData({ ...formData, slots: newSlots });
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

      <Card className="glass-card overflow-hidden border-0 shadow-lg">
        <div className="table-responsive">
          <Table hover className="mb-0 bg-transparent align-middle border-0">
            <thead className="bg-white bg-opacity-5">
              <tr>
                <th className="py-4 ps-4 text-muted small fw-bold" style={{ letterSpacing: '1px' }}>STATION NAME</th>
                <th className="py-4 text-muted small fw-bold" style={{ letterSpacing: '1px' }}>LOCATION</th>
                <th className="py-4 text-muted small fw-bold text-center" style={{ letterSpacing: '1px' }}>SLOTS</th>
                <th className="py-4 text-muted small fw-bold text-center" style={{ letterSpacing: '1px' }}>STATUS</th>
                <th className="py-4 pe-4 text-muted small fw-bold text-end" style={{ letterSpacing: '1px' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {stations.map((station) => (
                <tr key={station._id} className="border-white border-opacity-5 hover-glow transition-all">
                  <td className="bg-transparent py-4 ps-4">
                    <div className="text-white fw-bold fs-6">{station.name}</div>
                    <div className="text-muted" style={{ fontSize: '0.7rem' }}>STN-ID: {station._id.substring(0, 10).toUpperCase()}</div>
                  </td>
                  <td className="bg-transparent py-4">
                    <div className="d-flex align-items-center gap-2 text-white small">
                      <div className="bg-primary bg-opacity-10 p-1.5 rounded-circle text-primary">
                        <MapPin size={14} />
                      </div>
                      <span className="text-truncate" style={{ maxWidth: '250px' }}>{station.location.address}</span>
                    </div>
                  </td>
                  <td className="bg-transparent py-4 text-center">
                    <Badge bg="primary" className="bg-opacity-10 text-primary border border-primary border-opacity-20 px-3 py-2 fw-bold">
                      <Zap size={12} className="me-1" /> {station.slots?.length || 0} / {station.totalSlots}
                    </Badge>
                  </td>
                  <td className="bg-transparent py-4 text-center">
                    {station.isActive ? (
                      <div className="d-flex align-items-center justify-content-center gap-2 text-success small fw-bold">
                        <div className="bg-success rounded-circle shadow-glow" style={{ width: '8px', height: '8px' }}></div>
                        ONLINE
                      </div>
                    ) : (
                      <div className="d-flex align-items-center justify-content-center gap-2 text-danger small fw-bold">
                        <div className="bg-danger rounded-circle" style={{ width: '8px', height: '8px' }}></div>
                        OFFLINE
                      </div>
                    )}
                  </td>
                  <td className="bg-transparent py-4 pe-4 text-end">
                    <div className="d-flex gap-2 justify-content-end">
                      <Button variant="outline-primary" size="sm" className="rounded-pill px-3 border-opacity-25" onClick={() => handleEdit(station)}>
                        <Edit size={14} className="me-1" /> Edit
                      </Button>
                      <Button variant="outline-danger" size="sm" className="rounded-circle p-2 border-opacity-25" onClick={() => handleDelete(station._id)}>
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
              <Col md={12}>
                <div className="mb-2 d-flex justify-content-between align-items-center">
                  <Form.Label className="text-muted small fw-bold mb-0">CONFIGURED TIME SLOTS</Form.Label>
                  <Badge bg="primary" className="bg-opacity-10 text-primary border border-primary border-opacity-20">
                    {formData.slots.length} SLOTS
                  </Badge>
                </div>
                <div className="d-flex flex-wrap gap-2 mb-3 p-4 bg-white bg-opacity-5 rounded-4 border border-white border-opacity-10 min-vh-10" style={{ minHeight: '100px' }}>
                  {formData.slots.length > 0 ? formData.slots.map((slot, index) => (
                    <Badge 
                      key={index} 
                      bg="primary" 
                      className="px-3 py-2 d-flex align-items-center gap-2 border border-primary border-opacity-50 shadow-sm transition-all"
                      style={{ fontSize: '0.8rem', fontWeight: '600', borderRadius: '12px' }}
                    >
                      {slot}
                      <X 
                        size={16} 
                        className="cursor-pointer hover-opacity ms-1" 
                        onClick={() => removeSlot(index)} 
                        style={{ opacity: 0.7 }} 
                      />
                    </Badge>
                  )) : (
                    <div className="w-100 d-flex align-items-center justify-content-center flex-column text-muted py-2">
                      <Calendar size={24} className="mb-2 opacity-20" />
                      <span className="small italic opacity-50">No custom slots. Default 24-hour cycle will be used.</span>
                    </div>
                  )}
                </div>
                <div className="d-flex gap-2">
                  <Form.Control 
                    type="text" 
                    className="bg-transparent text-white border-white border-opacity-20"
                    placeholder="e.g. 10:00 AM - 11:00 AM" 
                    value={newSlot}
                    onChange={(e) => setNewSlot(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSlot();
                      }
                    }}
                  />
                  <Button variant="outline-primary" onClick={addSlot} type="button">Add</Button>
                </div>
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
