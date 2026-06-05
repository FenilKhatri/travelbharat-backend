import mongoose from "mongoose";

const uri = "mongodb+srv://travelbharat:travelbharatunifiedmentor@travelbharat.fajh2mo.mongodb.net/travelbharat?appName=TravelBharat";

const fixTips = async () => {
    try {
        await mongoose.connect(uri);
        const db = mongoose.connection.db;
        const places = await db.collection("touristplaces").find({}).toArray();

        let updatedCount = 0;

        for (const place of places) {
            if (place.tips && Array.isArray(place.tips)) {
                let needsUpdate = false;
                const newTips = [];

                for (let tip of place.tips) {
                    if (typeof tip === "string" && tip.trim().startsWith("[")) {
                        // It's a stringified array
                        try {
                            // Since the string contains single quotes and no strict JSON format,
                            // we'll try to extract the text using regex
                            const extracted = tip.match(/type:\s*['"]([^'"]+)['"]/g);
                            if (extracted) {
                                extracted.forEach(e => {
                                    const match = e.match(/type:\s*['"]([^'"]+)['"]/);
                                    if (match && match[1]) {
                                        newTips.push(match[1]);
                                    }
                                });
                                needsUpdate = true;
                            } else {
                                // Just push the string as is if we can't parse
                                newTips.push(tip);
                            }
                        } catch (err) {
                            newTips.push(tip);
                        }
                    } else if (typeof tip === "object" && tip.type) {
                        newTips.push(tip.type);
                        needsUpdate = true;
                    } else {
                        newTips.push(tip);
                    }
                }

                if (needsUpdate) {
                    await db.collection("touristplaces").updateOne(
                        { _id: place._id },
                        { $set: { tips: newTips } }
                    );
                    updatedCount++;
                }
            }
        }

        console.log(`Successfully fixed tips for ${updatedCount} places.`);
    } catch (err) {
        console.error("Error fixing tips:", err);
    } finally {
        await mongoose.disconnect();
    }
};

fixTips();
