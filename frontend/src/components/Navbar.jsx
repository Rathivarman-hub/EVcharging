import React from 'react';
import { Navbar as BsNavbar, Container, Nav, Dropdown, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, Zap, Menu } from 'lucide-react';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <BsNavbar expand="lg" variant="dark" className="sticky-top">
      <Container fluid className="px-3 px-md-4">
        <div className="d-flex align-items-center gap-2">
          {user && (
            <Button 
              variant="link" 
              className="text-white p-0 d-lg-none me-2" 
              onClick={onToggleSidebar}
            >
              <Menu size={24} />
            </Button>
          )}
          <BsNavbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2 fw-bold">
            <div className="bg-primary p-1 rounded">
              <Zap size={20} color="white" fill="white" />
            </div>
            <span className="text-white">EVCharge</span>
          </BsNavbar.Brand>
        </div>
        
        <BsNavbar.Toggle aria-controls="basic-navbar-nav" className="border-0 shadow-none" />
        
        <BsNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center gap-3 mt-3 mt-lg-0">
            {!user ? (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register" className="p-0">
                  <Button variant="primary" size="sm" className="w-100">Register</Button>
                </Nav.Link>
              </>
            ) : (
              <Dropdown align="end" className="w-100 w-lg-auto">
                <Dropdown.Toggle variant="transparent" id="dropdown-user" className="p-2 p-lg-0 border-0 d-flex align-items-center gap-2 text-white w-100 justify-content-between justify-content-lg-start">
                  <div className="d-flex align-items-center gap-2">
                    <div className="bg-secondary rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: '35px', height: '35px' }}>
                      <User size={18} />
                    </div>
                    <span>{user.name}</span>
                  </div>
                </Dropdown.Toggle>

                <Dropdown.Menu variant="dark" className="glass-card mt-2 border-0 shadow-lg">
                  <Dropdown.Item as={Link} to="/dashboard">Profile</Dropdown.Item>
                  <Dropdown.Divider className="bg-white bg-opacity-10" />
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
