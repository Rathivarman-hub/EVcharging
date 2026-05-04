import React from 'react';
import { Nav, Button } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, MapPin, CalendarCheck, ShieldCheck, Settings, X } from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Find Stations', path: '/stations', icon: <MapPin size={20} /> },
    { name: 'My Bookings', path: '/bookings', icon: <CalendarCheck size={20} /> },
  ];

  const adminItems = [
    { name: 'Admin Overview', path: '/admin', icon: <ShieldCheck size={20} /> },
    { name: 'Manage Stations', path: '/admin/stations', icon: <Settings size={20} /> },
  ];

  const handleLinkClick = () => {
    if (window.innerWidth < 992) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed-top w-100 h-100 d-lg-none" 
          style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1035, backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        />
      )}

      <div className={`sidebar p-3 ${isOpen ? 'show' : ''}`} style={{ width: '240px' }}>
        <div className="d-flex justify-content-between align-items-center d-lg-none mb-4">
          <span className="fw-bold text-primary">MENU</span>
          <Button variant="link" className="text-white p-0" onClick={onClose}>
            <X size={24} />
          </Button>
        </div>

        <Nav className="flex-column gap-2 mt-lg-3">
          <small className="text-muted text-uppercase fw-bold mb-2 ps-2" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>Menu</small>
          {menuItems.map((item) => (
            <Nav.Link
              key={item.path}
              as={Link}
              to={item.path}
              onClick={handleLinkClick}
              className={`d-flex align-items-center gap-3 py-2 px-3 rounded-3 transition-all ${
                location.pathname === item.path ? 'active bg-primary text-white' : ''
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Nav.Link>
          ))}

          {user?.role === 'admin' && (
            <>
              <small className="text-muted text-uppercase fw-bold mb-2 mt-4 ps-2" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>Admin</small>
              {adminItems.map((item) => (
                <Nav.Link
                  key={item.path}
                  as={Link}
                  to={item.path}
                  onClick={handleLinkClick}
                  className={`d-flex align-items-center gap-3 py-2 px-3 rounded-3 transition-all ${
                    location.pathname === item.path ? 'active bg-primary text-white' : ''
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Nav.Link>
              ))}
            </>
          )}
        </Nav>
      </div>
    </>
  );
};

export default Sidebar;
