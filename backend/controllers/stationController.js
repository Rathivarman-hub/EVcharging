import Station from '../models/Station.js';
import Slot from '../models/Slot.js';
import Booking from '../models/Booking.js';

export const addStation = async (req, res) => {
  try {
    const { name, location, totalSlots, slots: customSlots } = req.body;
    
    // Generate full 24-hour cycle slots
    const baseTimeSlots = [
      '12:00 AM - 01:00 AM', '01:00 AM - 02:00 AM', '02:00 AM - 03:00 AM', '03:00 AM - 04:00 AM',
      '04:00 AM - 05:00 AM', '05:00 AM - 06:00 AM', '06:00 AM - 07:00 AM', '07:00 AM - 08:00 AM',
      '08:00 AM - 09:00 AM', '09:00 AM - 10:00 AM', '10:00 AM - 11:00 AM', '11:00 AM - 12:00 PM',
      '12:00 PM - 01:00 PM', '01:00 PM - 02:00 PM', '02:00 PM - 03:00 PM', '03:00 PM - 04:00 PM',
      '04:00 PM - 05:00 PM', '05:00 PM - 06:00 PM', '06:00 PM - 07:00 PM', '07:00 PM - 08:00 PM',
      '08:00 PM - 09:00 PM', '09:00 PM - 10:00 PM', '10:00 PM - 11:00 PM', '11:00 PM - 12:00 AM'
    ];

    const slotsToCreate = (customSlots && customSlots.length > 0) ? customSlots : baseTimeSlots;
    const finalTotalSlots = Math.max(totalSlots || 0, slotsToCreate.length);

    const station = await Station.create({ 
      name, 
      location, 
      totalSlots: finalTotalSlots 
    });

    const slotDocs = await Promise.all(
      slotsToCreate.map(time => {
        return new Slot({
          station: station._id,
          time: typeof time === 'string' ? time : time.time,
          isBooked: false
        }).save();
      })
    );

    station.slots = slotDocs.map(slot => slot._id);
    await station.save();

    // Emit real-time event to all connected clients
    const io = req.app.get('io');
    if (io) io.emit('station_created', { stationId: station._id });

    res.status(201).json(station);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateStation = async (req, res) => {
  try {
    const { slots: customSlots, ...updateData } = req.body;
    const station = await Station.findById(req.params.id);
    
    if (!station) return res.status(404).json({ message: 'Station not found' });

    // Update basic info
    Object.assign(station, updateData);

    // Update slots if provided or if we want to ensure full coverage
    if (customSlots) {
      // Replace all slots for this station
      await Slot.deleteMany({ station: station._id });
      
      const slotDocs = await Promise.all(
        customSlots.map(time => {
          return new Slot({
            station: station._id,
            time: typeof time === 'string' ? time : time.time,
            isBooked: false
          }).save();
        })
      );
      station.slots = slotDocs.map(slot => slot._id);
      station.totalSlots = Math.max(station.totalSlots, customSlots.length);
    }

    await station.save();

    // Emit real-time event to all connected clients
    const io = req.app.get('io');
    if (io) io.emit('station_updated', { stationId: station._id });

    res.status(200).json(station);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteStation = async (req, res) => {
  try {
    const station = await Station.findByIdAndDelete(req.params.id);
    if (!station) return res.status(404).json({ message: 'Station not found' });

    // Emit real-time event to all connected clients
    const io = req.app.get('io');
    if (io) io.emit('station_deleted', { stationId: req.params.id });

    res.status(200).json({ message: 'Station deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllStations = async (req, res) => {
  try {
    const stations = await Station.find().populate('slots').lean();

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const stationIds = stations.map((station) => station._id);
    const activeBookings = await Booking.find({
      station: { $in: stationIds },
      date: { $gte: startOfDay, $lt: endOfDay },
      status: { $in: ['pending', 'confirmed', 'completed'] },
    }).select('slot station');

    const bookedSlotsByStation = new Map();
    activeBookings.forEach(({ station, slot }) => {
      const stationKey = station.toString();
      if (!bookedSlotsByStation.has(stationKey)) {
        bookedSlotsByStation.set(stationKey, new Set());
      }
      bookedSlotsByStation.get(stationKey).add(slot.toString());
    });

    const stationsWithAvailability = stations.map((station) => {
      const bookedSlots = bookedSlotsByStation.get(station._id.toString()) || new Set();
      return {
        ...station,
        slots: (station.slots || []).map((slot) => ({
          ...slot,
          isBooked: bookedSlots.has(slot._id.toString()),
        })),
      };
    });

    res.status(200).json(stationsWithAvailability);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStationById = async (req, res) => {
  try {
    const station = await Station.findById(req.params.id).populate('slots').lean();
    if (!station) return res.status(404).json({ message: 'Station not found' });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const activeBookings = await Booking.find({
      station: station._id,
      date: { $gte: startOfDay, $lt: endOfDay },
      status: { $in: ['pending', 'confirmed', 'completed'] },
    }).select('slot');

    const bookedSlotIds = new Set(activeBookings.map((booking) => booking.slot.toString()));

    const stationWithAvailability = {
      ...station,
      slots: (station.slots || []).map((slot) => ({
        ...slot,
        isBooked: bookedSlotIds.has(slot._id.toString()),
      })),
    };

    res.status(200).json(stationWithAvailability);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getNearbyStations = async (req, res) => {
  const { lng, lat, distance = 10000 } = req.query; // default 10km

  try {
    const stations = await Station.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(distance)
        }
      }
    });
    res.status(200).json(stations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
