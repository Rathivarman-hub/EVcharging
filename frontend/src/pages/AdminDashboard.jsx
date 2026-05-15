import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Table, Badge } from 'react-bootstrap';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { Users, Calendar, MapPin, TrendingUp, MoreVertical, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { socket } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    fetchAdminData();

    if (socket) {
      socket.on('adminUpdate', () => {
        fetchAdminData();
      });
      return () => socket.off('adminUpdate');
    }
  }, [socket]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const { data: statsData } = await api.get('/admin/stats');
      const { data: bookingsData } = await api.get('/admin/bookings');

      setStats({
        totalUsers: statsData.totalUsers,
        totalBookings: statsData.totalBookings,
        activeStations: statsData.totalStations,
        revenue: statsData.totalBookings * 250, // Simple revenue estimate (₹250 per booking)
        chartData: statsData.peakHours.map(item => ({
          name: item.time,
          bookings: item.count
        }))
      });

      setRecentBookings(bookingsData.slice(0, 5));
    } catch (error) {
      console.error("Admin data fetch error", error);
      toast.error('Failed to load real-time analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h1 className="fw-bold text-white mb-1">Admin Overview</h1>
          <p className="text-muted">System-wide analytics and management.</p>
        </div>
        <Button variant="outline-primary" size="sm" className="d-flex align-items-center gap-2" onClick={fetchAdminData}>
          <RefreshCw size={14} /> Refresh Data
        </Button>
      </div>

      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="glass-card p-3 border-0">
            <div className="d-flex align-items-center gap-3">
              <div className="bg-primary bg-opacity-10 p-3 rounded-3 text-primary">
                <Users size={24} />
              </div>
              <div>
                <h3 className="text-white fw-bold mb-0">{stats?.totalUsers}</h3>
                <p className="text-muted small mb-0">Total Users</p>
              </div>
            </div>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="glass-card p-3 border-0">
            <div className="d-flex align-items-center gap-3">
              <div className="bg-accent bg-opacity-10 p-3 rounded-3" style={{ color: '#10b981' }}>
                <Calendar size={24} />
              </div>
              <div>
                <h3 className="text-white fw-bold mb-0">{stats?.totalBookings}</h3>
                <p className="text-muted small mb-0">Total Bookings</p>
              </div>
            </div>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="glass-card p-3 border-0">
            <div className="d-flex align-items-center gap-3">
              <div className="bg-info bg-opacity-10 p-3 rounded-3 text-info">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="text-white fw-bold mb-0">{stats?.activeStations}</h3>
                <p className="text-muted small mb-0">Active Stations</p>
              </div>
            </div>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="glass-card p-3 border-0">
            <div className="d-flex align-items-center gap-3">
              <div className="bg-warning bg-opacity-10 p-3 rounded-3 text-warning">
                <TrendingUp size={24} />
              </div>
              <div>
                <h3 className="text-white fw-bold mb-0">₹{stats?.revenue}</h3>
                <p className="text-muted small mb-0">Monthly Revenue</p>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col lg={8}>
          <Card className="glass-card p-4 h-100">
            <h5 className="text-white fw-bold mb-4">Booking Trends</h5>
            <div style={{ height: '300px', width: '100%', minHeight: '300px' }}>
              {stats?.chartData && stats.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300} minWidth={0} minHeight={0}>
                  <AreaChart data={stats.chartData}>
                    <defs>
                      <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--bg-dark)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      itemStyle={{ color: 'var(--primary)' }}
                    />
                    <Area type="monotone" dataKey="bookings" stroke="var(--primary)" fillOpacity={1} fill="url(#colorBookings)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-100 d-flex align-items-center justify-content-center text-muted">
                  No trend data available
                </div>
              )}
            </div>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="glass-card h-100">
            <Card.Header className="bg-transparent border-white border-opacity-10 p-4">
              <h5 className="text-white fw-bold mb-0">Recent Bookings</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table variant="dark" hover className="mb-0 bg-transparent">
                  <tbody>
                    {recentBookings.length > 0 ? recentBookings.map((booking) => (
                      <tr key={booking._id} className="border-white border-opacity-5">
                        <td className="bg-transparent py-3 ps-4">
                          <div className="text-white fw-medium small">{booking.user?.name || 'User'}</div>
                          <div className="text-muted" style={{ fontSize: '0.7rem' }}>{booking.station?.name}</div>
                        </td>
                        <td className="bg-transparent py-3 text-end pe-4">
                          <Badge bg="primary" style={{ fontSize: '0.65rem' }}>{booking.slot?.time}</Badge>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="2" className="text-center p-5 text-muted small bg-transparent">No recent bookings</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
              <div className="p-3 text-center border-top border-white border-opacity-5">
                <Button variant="link" className="text-primary text-decoration-none small fw-bold">View All Transactions</Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
