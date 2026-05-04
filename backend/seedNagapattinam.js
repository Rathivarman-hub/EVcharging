import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import Station from './models/Station.js';
import Slot from './models/Slot.js';

dotenv.config();

// Apply DNS fix
dns.setServers(['8.8.8.8', '1.1.1.1']);

const seedNagapattinam = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB...');

    // Remove any existing Nagapattinam station for a clean slate
    const existingStation = await Station.findOne({ name: 'Nagapattinam Fast Charge Hub' });
    if (existingStation) {
      await Slot.deleteMany({ station: existingStation._id });
      await Station.deleteOne({ _id: existingStation._id });
      console.log('Removed old test station.');
    }

    // Create the station
    const station = new Station({
      name: 'Nagapattinam Fast Charge Hub',
      location: {
        type: 'Point',
        coordinates: [79.8433, 10.7672], // [longitude, latitude] for Nagapattinam
        address: '12 Beach Road, Near New Bus Stand, Nagapattinam, Tamil Nadu 611001'
      },
      totalSlots: 4,
      isActive: true
    });

    const savedStation = await station.save();

    // Create slots
    const timeSlots = [
      '10:00 AM - 11:00 AM',
      '11:00 AM - 12:00 PM',
      '01:00 PM - 02:00 PM',
      '02:00 PM - 03:00 PM'
    ];

    const slotDocs = await Promise.all(
      timeSlots.map(time => {
        return new Slot({
          station: savedStation._id,
          time: time,
          isBooked: false
        }).save();
      })
    );

    // Update station with slot IDs
    savedStation.slots = slotDocs.map(slot => slot._id);
    await savedStation.save();

    console.log(`✅ Successfully added ${savedStation.name} in Nagapattinam!`);
    console.log(`🔌 It has ${slotDocs.length} available slots.`);
    
    mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedNagapattinam();
