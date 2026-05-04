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
    totalSlots: 6
  },
  {
    name: 'Coimbatore Auto Hub',
    location: {
      type: 'Point',
      coordinates: [76.9558, 11.0168],
      address: '45 Avinashi Road, Peelamedu, Coimbatore, Tamil Nadu 641004'
    },
    totalSlots: 8
  },
  {
    name: 'Madurai Temple Connect',
    location: {
      type: 'Point',
      coordinates: [78.1198, 9.9252],
      address: '12 West Masi Street, Madurai, Tamil Nadu 625001'
    },
    totalSlots: 4
  },
  {
    name: 'Trichy FastCharge Station',
    location: {
      type: 'Point',
      coordinates: [78.6928, 10.7905],
      address: '89 Cantonment Area, Tiruchirappalli, Tamil Nadu 620001'
    },
    totalSlots: 5
  },
  {
    name: 'Salem Highway Stop',
    location: {
      type: 'Point',
      coordinates: [78.1460, 11.6643],
      address: 'NH 44 Bypass, Salem, Tamil Nadu 636004'
    },
    totalSlots: 3
  },
  {
    name: 'Kanyakumari Coast Charger',
    location: {
      type: 'Point',
      coordinates: [77.5385, 8.0883],
      address: 'Beach Road, Kanyakumari, Tamil Nadu 629702'
    },
    totalSlots: 4
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
  '05:00 PM - 06:00 PM'
];

const seedTamilNadu = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB...');

    // Clear existing stations (Optional, but good for a fresh start. We won't delete Nagapattinam, we'll just add these)
    // Actually, let's keep existing stations and just add these if they don't exist
    
    for (const data of stationsData) {
      const existing = await Station.findOne({ name: data.name });
      if (existing) {
        console.log(`Station ${data.name} already exists. Skipping.`);
        continue;
      }

      const station = new Station({
        name: data.name,
        location: data.location,
        totalSlots: data.totalSlots,
        isActive: true
      });

      const savedStation = await station.save();

      // Create slots based on totalSlots (randomly pick consecutive slots)
      const stationSlots = timeSlots.slice(0, data.totalSlots);
      
      const slotDocs = await Promise.all(
        stationSlots.map(time => {
          // Randomly make some slots booked for realism
          const isBooked = Math.random() > 0.7; // 30% chance of being booked
          return new Slot({
            station: savedStation._id,
            time: time,
            isBooked: isBooked
          }).save();
        })
      );

      savedStation.slots = slotDocs.map(slot => slot._id);
      await savedStation.save();

      console.log(`✅ Added ${savedStation.name} in ${savedStation.location.address.split(',')[1].trim()} with ${slotDocs.filter(s => !s.isBooked).length} free slots.`);
    }

    console.log('🎉 Tamil Nadu Seeding Complete!');
    mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedTamilNadu();
