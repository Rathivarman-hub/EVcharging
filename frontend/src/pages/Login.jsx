import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, InputGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: '400px' }}
      >
        <Card className="glass-card p-4">
          <div className="text-center mb-4">
            <h2 className="fw-bold text-white">Welcome Back</h2>
            <p className="text-muted">Sign in to manage your bookings</p>
          </div>

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label className="text-muted small fw-bold">EMAIL ADDRESS</Form.Label>
                <InputGroup>
                  <InputGroup.Text className="bg-transparent border-end-0 text-muted">
                    <Mail size={18} />
                  </InputGroup.Text>
                  <Form.Control
                    type="email"
                    placeholder="Enter your email"
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
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="ps-0"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <InputGroup.Text 
                    className="bg-transparent border-start-0 text-muted cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </InputGroup.Text>
                </InputGroup>
              </Form.Group>

              <Button
                variant="primary" 
                type="submit" 
                className="w-100 mb-3 d-flex align-items-center justify-content-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing in...' : (
                  <>
                    <LogIn size={20} />
                    Sign In
                  </>
                )}
              </Button>

              <div className="text-center">
                <p className="text-muted small">
                  Don't have an account? <Link to="/register" className="text-primary fw-bold text-decoration-none">Register</Link>
                </p>
              </div>
            </Form>
        </Card>
      </motion.div>
    </Container>
  );
};

export default Login;
