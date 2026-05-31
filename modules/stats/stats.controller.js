import { asyncHandler } from "../../common/middlewares/async.helper.js";
import { successResponse } from "../../common/utils/responseHandler.utils.js";
import State from "../state/state.model.js";
import City from "../city/city.model.js";
import TouristPlace from "../place/place.model.js";
import SavedTrip from "../trip/trip.model.js";
import UniversalLike from "../like/like.model.js";
import Review from "../review/review.model.js";
import Blog from "../blog/blog.model.js";
// GET /api/stats/public — aggregate counts for public display
export const getPublicStats = asyncHandler(async (req, res) => {
    const [states, cities, destinations, experiences] = await Promise.all([
        State.countDocuments({ isActive: true }),
        City.countDocuments({ isActive: true }),
        TouristPlace.countDocuments({ isActive: true }),
        TouristPlace.countDocuments({ isActive: true, category: { $in: ["heritage", "temple", "religious", "museum", "fort", "palace"] } }),
    ]);

    return successResponse(res, 200, "Public stats fetched", {
        states,
        cities,
        destinations,
        experiences,
    });
});

// GET /api/stats/states-destination-counts — destination counts per state via aggregation
export const getStatesDestinationCounts = asyncHandler(async (req, res) => {
    const counts = await TouristPlace.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: "$stateId", count: { $sum: 1 } } },
    ]);

    const countMap = {};
    counts.forEach((c) => {
        countMap[c._id.toString()] = c.count;
    });

    return successResponse(res, 200, "Destination counts fetched", { counts: countMap });
});

// GET /api/stats/user-dashboard
export const getUserDashboardStats = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const trips = await SavedTrip.find({ userId }).populate("places.placeId").lean();
    const likes = await UniversalLike.find({ userId }).populate("entityId").lean();
    const reviews = await Review.find({ userId }).lean();
    const writtenBlogs = await Blog.find({ author: userId }).lean();

    const states = new Set();
    const cities = new Set();
    const destinations = new Set();
    
    let completedTrips = 0;
    
    trips.forEach(t => {
        if (t.status === "completed") completedTrips++;
        t.places.forEach(p => {
            if (p.placeId) {
                destinations.add(p.placeId._id.toString());
                if (p.placeId.stateId) states.add(p.placeId.stateId.toString());
                if (p.placeId.cityId) cities.add(p.placeId.cityId.toString());
            }
        });
    });

    const savedBlogs = likes.filter(l => l.entityType === "blog").length;
    const avgRating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : 0;
    
    const badges = [];
    if (destinations.size >= 5) badges.push({ id: "explorer", name: "Explorer", icon: "🗺️", desc: "Explored 5+ destinations", color: "from-green-500 to-emerald-700" });
    if (destinations.size >= 10) badges.push({ id: "adventurer", name: "Adventurer", icon: "🛡️", desc: "Explored 10+ destinations", color: "from-blue-500 to-indigo-700" });
    if (states.size >= 3) badges.push({ id: "state_collector", name: "State Collector", icon: "🇮🇳", desc: "Visited 3+ states", color: "from-orange-500 to-red-600" });
    if (writtenBlogs.length >= 1) badges.push({ id: "storyteller", name: "Storyteller", icon: "✍️", desc: "Wrote a travel story", color: "from-purple-500 to-pink-600" });
    if (reviews.length >= 3) badges.push({ id: "critic", name: "Local Critic", icon: "⭐", desc: "Wrote 3+ reviews", color: "from-yellow-400 to-yellow-600" });
    if (trips.length >= 1) badges.push({ id: "planner", name: "Trip Planner", icon: "📅", desc: "Planned a trip", color: "from-cyan-400 to-cyan-600" });

    if (badges.length === 0) badges.push({ id: "newbie", name: "Novice Traveler", icon: "🌱", desc: "Just started the journey", color: "from-gray-400 to-gray-600" });

    // Timelines
    let timeline = [];
    trips.slice(0,5).forEach(t => timeline.push({ type: 'trip', action: 'Planned a trip', item: t.name, date: t.createdAt }));
    likes.slice(0,5).forEach(l => timeline.push({ type: 'like', action: `Liked a ${l.entityType}`, item: l.entityId?.title || l.entityId?.name || "Content", date: l.createdAt }));
    reviews.slice(0,5).forEach(r => timeline.push({ type: 'review', action: 'Wrote a review', item: r.title || "Experience", date: r.createdAt }));
    
    timeline.sort((a, b) => new Date(b.date) - new Date(a.date));
    timeline = timeline.slice(0, 8);

    return successResponse(res, 200, "User stats fetched", {
        stats: {
            statesExplored: states.size,
            citiesVisited: cities.size,
            destinationsExplored: destinations.size,
            tripsCompleted: completedTrips,
            totalTrips: trips.length,
            savedBlogs,
            travelStories: writtenBlogs.length,
            avgRating
        },
        badges,
        timeline
    });
});
