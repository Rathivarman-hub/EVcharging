import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import Station from './models/Station.js';
import Slot from './models/Slot.js';

dotenv.config();
dns.setServers(['8.8.8.8', '1.1.1.1']);

const cleanup = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB...');

    // Find all Nagapattinam stations sorted by creation date (oldest first)
    const nagaStations = await Station.find({ name: 'Nagapattinam Fast Charge Hub' }).sort({ createdAt: 1 });
    console.log(`Found ${nagaStations.length} Nagapattinam station(s).`);

    if (nagaStations.length > 1) {
      // Delete all except the newest one (last in array)
      const toDelete = nagaStations.slice(0, nagaStations.length - 1);
      for (const s of toDelete) {
        await Slot.deleteMany({ station: s._id });
        await Station.deleteOne({ _id: s._id });
        console.log(`🗑️  Deleted duplicate: ${s._id} (created ${s.createdAt})`);
      }
      console.log('✅ Duplicate removed. Keeping newest Nagapattinam station.');
    } else {
      console.log('✅ No duplicates found.');
    }

    mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

cleanup();
