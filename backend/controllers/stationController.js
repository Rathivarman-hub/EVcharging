import Station from '../models/Station.js';
import Slot from '../models/Slot.js';
import Booking from '../models/Booking.js';

export const addStation = async (req, res) => {
  try {
    const { name, location, totalSlots } = req.body;
    const station = await Station.create({ name, location, totalSlots });

    // Generate slots
    const baseTimeSlots = [
      '09:00 AM - 10:00 AM', '10:00 AM - 11:00 AM', '11:00 AM - 12:00 PM',
      '01:00 PM - 02:00 PM', '02:00 PM - 03:00 PM', '03:00 PM - 04:00 PM',
      '04:00 PM - 05:00 PM', '05:00 PM - 06:00 PM'
    ];
    
    // Create slots based on totalSlots requested (up to the max in baseTimeSlots)
    const slotsToCreate = baseTimeSlots.slice(0, Math.min(totalSlots, baseTimeSlots.length));
    
    const slotDocs = await Promise.all(
      slotsToCreate.map(time => {
        return new Slot({
          station: station._id,
          time: time,
          isBooked: false
        }).save();
      })
    );

    // Update station with slot references
    station.slots = slotDocs.map(slot => slot._id);
    await station.save();

    res.status(201).json(station);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateStation = async (req, res) => {
  try {
    const station = await Station.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!station) return res.status(404).json({ message: 'Station not found' });
    res.status(200).json(station);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteStation = async (req, res) => {
  try {
    const station = await Station.findByIdAndDelete(req.params.id);
    if (!station) return res.status(404).json({ message: 'Station not found' });
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
