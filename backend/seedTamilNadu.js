import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import Station from './models/Station.js';
import Slot from './models/Slot.js';

dotenv.config();

// Apply DNS fix
dns.setServers(['8.8.8.8', '1.1.1.1']);

const stationsData = [
  {
    name: 'Chennai Central Charge Hub',
    location: {
      type: 'Point',
      coordinates: [80.2707, 13.0827],
      address: '10 Mount Road, Near Central Station, Chennai, Tamil Nadu 600002'
    },
    numPumps: 5
  },
  {
    name: 'Coimbatore Auto Hub',
    location: {
      type: 'Point',
      coordinates: [76.9558, 11.0168],
      address: '45 Avinashi Road, Peelamedu, Coimbatore, Tamil Nadu 641004'
    },
    numPumps: 4
  },
  {
    name: 'Madurai Temple Connect',
    location: {
      type: 'Point',
      coordinates: [78.1198, 9.9252],
      address: '12 West Masi Street, Madurai, Tamil Nadu 625001'
    },
    numPumps: 4
  },
  {
    name: 'Trichy FastCharge Station',
    location: {
      type: 'Point',
      coordinates: [78.6928, 10.7905],
      address: '89 Cantonment Area, Tiruchirappalli, Tamil Nadu 620001'
    },
    numPumps: 6
  },
  {
    name: 'Salem Highway Stop',
    location: {
      type: 'Point',
      coordinates: [78.1460, 11.6643],
      address: 'NH 44 Bypass, Salem, Tamil Nadu 636004'
    },
    numPumps: 4
  },
  {
    name: 'Kanyakumari Coast Charger',
    location: {
      type: 'Point',
      coordinates: [77.5385, 8.0883],
      address: 'Beach Road, Kanyakumari, Tamil Nadu 629702'
    },
    numPumps: 4
  },
  {
    name: 'Nagapattinam Fast Charge Hub',
    location: {
      type: 'Point',
      coordinates: [79.8433, 10.7672],
      address: '12 Beach Road, Near New Bus Stand, Nagapattinam, Tamil Nadu 611001'
    },
    numPumps: 4
  }
];

const timeSlots = [
  '09:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '01:00 PM - 02:00 PM',
  '02:00 PM - 03:00 PM',
  '03:00 PM - 04:00 PM',
  '04:00 PM - 05:00 PM',
  '05:00 PM - 06:00 PM',
  '06:00 PM - 07:00 PM'
];

const seedAllStations = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB...\n');

    for (const data of stationsData) {
      // Remove all existing stations with the same name for a clean re-seed
      const existingStations = await Station.find({ name: data.name });
      for (const existing of existingStations) {
        await Slot.deleteMany({ station: existing._id });
        await Station.deleteOne({ _id: existing._id });
        console.log(`🗑️  Removed old: ${data.name} (${existing._id})`);
      }

      const station = await new Station({
        name: data.name,
        location: data.location,
        totalSlots: data.numPumps, // totalSlots = number of pumps
        isActive: true
      }).save();

      // Create numPumps × timeSlots slot documents, each tagged with pumpNumber
      const slotDocs = [];
      for (let pump = 1; pump <= data.numPumps; pump++) {
        for (const time of timeSlots) {
          const isBooked = Math.random() > 0.75; // ~25% chance pre-booked for realism
          const slot = await new Slot({
            station: station._id,
            pumpNumber: pump,
            time,
            isBooked
          }).save();
          slotDocs.push(slot);
        }
      }

      station.slots = slotDocs.map(s => s._id);
      await station.save();

      const freeCount = slotDocs.filter(s => !s.isBooked).length;
      console.log(`✅ ${station.name} — ${data.numPumps} pumps, ${freeCount}/${slotDocs.length} slots free`);
    }

    console.log('\n🎉 All stations seeded successfully!');
    mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedAllStations();
