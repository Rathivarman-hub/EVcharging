import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  station: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Station',
    required: true
  },
  slot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Slot',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'confirmed'
  }
}, { timestamps: true });

// Enforce one active booking per slot/day, but allow re-booking after cancellation.
bookingSchema.index(
  { slot: 1, date: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['pending', 'confirmed', 'completed'] } },
  }
);

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
