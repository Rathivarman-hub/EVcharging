import mongoose from 'mongoose';

const slotSchema = new mongoose.Schema({
  station: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Station',
    required: true
  },
  pumpNumber: {
    type: Number,
    required: true,
    default: 1
  },
  time: {
    type: String, // e.g., '10:00 AM - 11:00 AM'
    required: true
  },
  isBooked: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const Slot = mongoose.model('Slot', slotSchema);
export default Slot;
