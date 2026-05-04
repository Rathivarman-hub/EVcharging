import React, { useState } from 'react';
import { Container, Form, Button, Card } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { CheckCircle, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const OTPVerify = () => {
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { verifyOTP, sendOTP } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  if (!email) {
    navigate('/register');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await verifyOTP(email, otp);
      toast.success('Account verified! You can now login.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resendOTP = async () => {
    try {
      await sendOTP(email);
      toast.info('OTP resent to your email');
    } catch (error) {
      toast.error('Failed to resend OTP');
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: '400px' }}
      >
        <Card className="glass-card p-4 text-center">
          <div className="bg-primary bg-opacity-10 p-3 rounded-circle d-inline-block mb-4 mx-auto">
            <ShieldCheck size={40} className="text-primary" />
          </div>
          <h2 className="fw-bold text-white mb-2">Verify Account</h2>
          <p className="text-muted mb-4">We've sent a 6-digit code to <strong>{email}</strong></p>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Control
                type="text"
                placeholder="Enter 6-digit OTP"
                className="bg-transparent text-white text-center fs-4 fw-bold letter-spacing-5 py-3"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
              />
            </Form.Group>

            <Button 
              variant="primary" 
              type="submit" 
              className="w-100 mb-3 py-3 d-flex align-items-center justify-content-center gap-2 fw-bold"
              disabled={isSubmitting || otp.length !== 6}
            >
              {isSubmitting ? 'Verifying...' : (
                <>
                  <CheckCircle size={20} />
                  Verify OTP
                </>
              )}
            </Button>

            <div className="text-center">
              <p className="text-muted small mb-0">
                Didn't receive code? <Button variant="link" className="text-primary p-0 fw-bold text-decoration-none small" onClick={resendOTP}>Resend</Button>
              </p>
            </div>
          </Form>
        </Card>
      </motion.div>
    </Container>
  );
};

export default OTPVerify;
