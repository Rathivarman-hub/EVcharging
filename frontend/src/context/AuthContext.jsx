import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';
import { io } from 'socket.io-client';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const decoded = jwtDecode(token);
          // Check if token is expired
          if (decoded.exp * 1000 < Date.now()) {
            localStorage.removeItem('accessToken');
            setUser(null);
          } else {
            // Ideally fetch latest user profile from backend
            const { data } = await api.get('/auth/profile');
            setUser(data);
          }
        } catch (error) {
          console.error('Auth verification failed', error);
          localStorage.removeItem('accessToken');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  useEffect(() => {
    if (user) {
      const newSocket = io('http://localhost:5000');
      setSocket(newSocket);
      return () => newSocket.close();
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [user]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.requiresOTP) {
      return data; // Return to component to trigger OTP state
    }
    localStorage.setItem('accessToken', data.accessToken);
    setUser(data);
    return data;
  };

  const verifyLogin = async (email, otp) => {
    const { data } = await api.post('/auth/verify-login', { email, otp });
    localStorage.setItem('accessToken', data.accessToken);
    setUser(data);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    return data;
  };

  const verifyOTP = async (email, otp) => {
    const { data } = await api.post('/auth/verify-otp', { email, otp });
    return data;
  };

  const sendOTP = async (email) => {
    const { data } = await api.post('/auth/send-otp', { email });
    return data;
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  const updateUserProfile = async (userData) => {
    const { data } = await api.put('/users/profile', userData);
    setUser(data);
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, verifyLogin, register, logout, verifyOTP, sendOTP, socket, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
