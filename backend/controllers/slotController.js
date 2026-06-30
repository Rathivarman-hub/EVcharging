import Slot from '../models/Slot.js';
import Station from '../models/Station.js';

export const createSlots = async (req, res) => {
  const { stationId } = req.params;
  const { timeSlots } = req.body; // array of strings e.g. ['10:00 AM', '11:00 AM']

  try {
    const station = await Station.findById(stationId);
    if (!station) return res.status(404).json({ message: 'Station not found' });

    const slots = await Promise.all(timeSlots.map(async (time) => {
      const slot = await Slot.create({ station: stationId, time });
      station.slots.push(slot._id);
      return slot;
    }));

    await station.save();
    res.status(201).json(slots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSlotsByStation = async (req, res) => {
  try {
    const slots = await Slot.find({ station: req.params.stationId });
    res.status(200).json(slots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSlotAvailability = async (req, res) => {
  const { isBooked } = req.body;
  try {
    const slot = await Slot.findByIdAndUpdate(req.params.slotId, { isBooked }, { new: true });
    if (!slot) return res.status(404).json({ message: 'Slot not found' });
    
    // Emit real-time update using global io instance (attached in index.js)
    if (req.app.get('io')) {
      req.app.get('io').emit('slotUpdate', { stationId: slot.station, slotId: slot._id, isBooked });
    }

    res.status(200).json(slot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
