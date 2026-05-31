import mongoose from 'mongoose';
import Notification from './modules/notification/notification.model.js';

const seed = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/travelbharat');
        await Notification.create({
            title: "Welcome to TravelBharat Admin",
            message: "Your new dashboard is live and running.",
            type: "system",
        });
        console.log("Notification seeded!");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
seed();
