import React from 'react';
import { Navbar as BsNavbar, Container, Nav, Dropdown, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, Zap } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <BsNavbar expand="lg" variant="dark" className="sticky-top">
      <Container fluid className="px-4">
        <BsNavbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2 fw-bold">
          <div className="bg-primary p-1 rounded">
            <Zap size={20} color="white" fill="white" />
          </div>
          <span className="text-white">EVCharge</span>
        </BsNavbar.Brand>
        
        <BsNavbar.Toggle aria-controls="basic-navbar-nav" />
        
        <BsNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center gap-3">
            {!user ? (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">
                  <Button variant="primary" size="sm">Register</Button>
                </Nav.Link>
              </>
            ) : (
              <Dropdown align="end">
                <Dropdown.Toggle variant="transparent" id="dropdown-user" className="p-0 border-0 d-flex align-items-center gap-2 text-white">
                  <div className="bg-secondary rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: '35px', height: '35px' }}>
                    <User size={18} />
                  </div>
                  <span className="d-none d-md-inline">{user.name}</span>
                </Dropdown.Toggle>

                <Dropdown.Menu variant="dark" className="glass-card mt-2">
                  <Dropdown.Item as={Link} to="/dashboard">Profile</Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout} className="text-danger d-flex align-items-center gap-2">
                    <LogOut size={16} />
                    Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
          </Nav>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
};

export default Navbar;
