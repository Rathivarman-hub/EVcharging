import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, InputGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Mail, Lock, User as UserIcon, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await register(name, email, password);
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: '450px' }}
      >
        <Card className="glass-card p-4">
          <div className="text-center mb-4">
            <h2 className="fw-bold text-white">Join EVCharge</h2>
            <p className="text-muted">Create an account to start booking slots</p>
          </div>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="text-muted small fw-bold">FULL NAME</Form.Label>
              <InputGroup>
                <InputGroup.Text className="bg-transparent border-end-0 text-muted">
                  <UserIcon size={18} />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Full Name"
                  className="ps-0"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="text-muted small fw-bold">EMAIL ADDRESS</Form.Label>
              <InputGroup>
                <InputGroup.Text className="bg-transparent border-end-0 text-muted">
                  <Mail size={18} />
                </InputGroup.Text>
                <Form.Control
                  type="email"
                  placeholder="email@example.com"
                  className="ps-0"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="text-muted small fw-bold">PASSWORD</Form.Label>
              <InputGroup>
                <InputGroup.Text className="bg-transparent border-end-0 text-muted">
                  <Lock size={18} />
                </InputGroup.Text>
                <Form.Control
                  type="password"
                  placeholder="Create password"
                  className="ps-0"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </InputGroup>
            </Form.Group>

            <Button 
              variant="primary" 
              type="submit" 
              className="w-100 mb-3 d-flex align-items-center justify-content-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating account...' : (
                <>
                  <UserPlus size={20} />
                  Register
                </>
              )}
            </Button>

            <div className="text-center">
              <p className="text-muted small">
                Already have an account? <Link to="/login" className="text-primary fw-bold text-decoration-none">Login</Link>
              </p>
            </div>
          </Form>
        </Card>
      </motion.div>
    </Container>
  );
};

export default Register;
