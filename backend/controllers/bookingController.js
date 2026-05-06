import Booking from '../models/Booking.js';
import Slot from '../models/Slot.js';
import Station from '../models/Station.js';
import { sendBookingConfirmation, sendCancellationEmail } from '../utils/mailUtils.js';

export const bookSlot = async (req, res) => {
  const { stationId, slotId, date } = req.body;

  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    // Prevent Double Booking
    const existingBooking = await Booking.findOne({ slot: slotId, date: startOfDay, status: { $ne: 'cancelled' } });
    if (existingBooking) {
      return res.status(400).json({ message: 'Slot is already booked for this date' });
    }

    const booking = await Booking.create({
      user: req.user._id,
      station: stationId,
      slot: slotId,
      date: startOfDay
    });

    await Slot.findByIdAndUpdate(slotId, { isBooked: true });

    // Emit real-time event
    if (req.app.get('io')) {
      req.app.get('io').emit('slotUpdate', { stationId, slotId, isBooked: true });
    }

    const station = await Station.findById(stationId);
    const slot = await Slot.findById(slotId);

    // Send confirmation email
    await sendBookingConfirmation(req.user.email, {
      stationName: station.name,
      date: startOfDay,
      timeSlot: slot.time
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    booking.status = 'cancelled';
    await booking.save();

    await Slot.findByIdAndUpdate(booking.slot, { isBooked: false });

    // Emit real-time event
    if (req.app.get('io')) {
      req.app.get('io').emit('slotUpdate', { stationId: booking.station, slotId: booking.slot, isBooked: false });
    }

    // Get station and slot details for the email
    const bookingWithDetails = await Booking.findById(req.params.id)
      .populate('station')
      .populate('slot');

    await sendCancellationEmail(req.user.email, {
      stationName: bookingWithDetails.station.name,
      date: bookingWithDetails.date,
      timeSlot: bookingWithDetails.slot.time
    });

    res.status(200).json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate('station').populate('slot');
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('user', 'name email').populate('station').populate('slot');
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const checkSlotAvailability = async (req, res) => {
  const { stationId, slotId, date } = req.query;
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const booking = await Booking.findOne({ slot: slotId, date: startOfDay, status: { $ne: 'cancelled' } });
    if (booking) {
      return res.status(200).json({ isAvailable: false });
    }
    res.status(200).json({ isAvailable: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
