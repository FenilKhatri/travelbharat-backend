import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";
import State from "./modules/state/state.model.js";

dotenv.config();
dns.setServers(['8.8.8.8', '8.8.4.4']);

mongoose.connect(process.env.MONGO_URI, { family: 4 }).then(async () => {
    const s = await State.findOne({ slug: 'gujarat' });
    console.log(s.heroImage);
    process.exit(0);
});
