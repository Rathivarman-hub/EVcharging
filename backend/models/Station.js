import mongoose from 'mongoose';

const stationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    address: {
      type: String,
      required: true
    }
  },
  totalSlots: {
    type: Number,
    required: true,
    min: 1
  },
  slots: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Slot'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Create a geospatial index on the location
stationSchema.index({ location: '2dsphere' });

const Station = mongoose.model('Station', stationSchema);
export default Station;
