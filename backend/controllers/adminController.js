import User from '../models/User.js';
import Booking from '../models/Booking.js';
import Station from '../models/Station.js';

export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalStations = await Station.countDocuments();

    // Calculate peak hours based on bookings
    const bookings = await Booking.find().populate('slot');
    const timeSlotsCount = {};

    bookings.forEach(booking => {
      if (booking.slot && booking.slot.time) {
        timeSlotsCount[booking.slot.time] = (timeSlotsCount[booking.slot.time] || 0) + 1;
      }
    });

    const peakHours = Object.entries(timeSlotsCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([time, count]) => ({ time, count }));

    res.status(200).json({
      totalUsers,
      totalBookings,
      totalStations,
      peakHours
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
