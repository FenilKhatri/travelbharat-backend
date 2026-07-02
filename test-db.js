import mongoose from 'mongoose';
import City from './modules/city/city.model.js';
import State from './modules/state/state.model.js';
import dns from "dns";
dns.setServers(['8.8.8.8', '8.8.4.4']);

(async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/travelbharat');
    console.log('Connected to DB');
    const city = await City.findOne({ slug: 'surat' });
    console.log('City stateId (raw):', city.stateId);
    
    const state = await State.findById(city.stateId);
    console.log('State found:', state ? state.name : 'NULL');
    
    // Find all states
    const states = await State.find({}, '_id name');
    console.log('Available states:', states);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
})();
