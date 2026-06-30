import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken } from '../utils/tokenUtils.js';

const normalizeEmail = (email = '') => email.trim().toLowerCase();

export const registerUser = async (req, res) => {
  const { password, name } = req.body;
  const email = normalizeEmail(req.body.email);
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    await User.create({ email, password, name, isVerified: true });
    res.status(201).json({ message: 'User registered successfully. Please login to continue.' });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  const { password } = req.body;
  const email = normalizeEmail(req.body.email);
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      res.cookie('jwt', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({ 
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        accessToken,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};
