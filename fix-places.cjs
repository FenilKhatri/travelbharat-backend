const mongoose = require('mongoose');
const uri = 'mongodb+srv://travelbharat:travelbharatunifiedmentor@travelbharat.fajh2mo.mongodb.net/travelbharat?appName=TravelBharat';
mongoose.connect(uri).then(async () => {
    const db = mongoose.connection.db;
    const places = await db.collection('touristplaces').find({}).toArray();
    let updated = 0;
    for(const p of places) {
        let update = {};
        if (typeof p.cityId === 'string' && mongoose.Types.ObjectId.isValid(p.cityId)) {
            update.cityId = new mongoose.Types.ObjectId(p.cityId);
        }
        if (typeof p.stateId === 'string' && mongoose.Types.ObjectId.isValid(p.stateId)) {
            update.stateId = new mongoose.Types.ObjectId(p.stateId);
        }
        if (typeof p.categoryId === 'string' && mongoose.Types.ObjectId.isValid(p.categoryId)) {
            update.categoryId = new mongoose.Types.ObjectId(p.categoryId);
        }
        
        if (Object.keys(update).length > 0) {
            await db.collection('touristplaces').updateOne({ _id: p._id }, { $set: update });
            updated++;
        }
    }
    console.log('Successfully updated', updated, 'places with ObjectId casting.');
    process.exit(0);
}).catch(console.error);
