import { asyncHandler } from "../../common/middlewares/async.helper.js";
import { successResponse } from "../../common/utils/responseHandler.utils.js";
import State from "../state/state.model.js";
import City from "../city/city.model.js";
import TouristPlace from "../place/place.model.js";
import Blog from "../blog/blog.model.js";
import Festival from "../festival/festival.model.js";

// Unified search across all entities
export const search = asyncHandler(async (req, res) => {
    const { q, type, limit = 5 } = req.query;

    if (!q || q.trim().length < 2) {
        return successResponse(res, 200, "Search results", { results: [] });
    }

    const regex = { $regex: q, $options: "i" };
    const searchLimit = parseInt(limit);

    const results = {};

    // Search by type or all
    if (!type || type === "states") {
        results.states = await State.find({ name: regex, isActive: true })
            .sort("-priority")
            .limit(searchLimit)
            .select("name slug images.thumbnail tagline");
    }

    if (!type || type === "cities") {
        results.cities = await City.find({ name: regex, isActive: true })
            .populate("stateId", "name slug")
            .sort("-priority")
            .limit(searchLimit)
            .select("name slug images.thumbnail stateId");
    }

    if (!type || type === "places") {
        results.places = await TouristPlace.find({ name: regex, isActive: true })
            .populate("stateId", "name slug")
            .populate("cityId", "name slug")
            .sort("-priority -rating")
            .limit(searchLimit)
            .select("name slug images.thumbnail category rating stateId cityId");
    }

    if (!type || type === "blogs") {
        results.blogs = await Blog.find({ title: regex, isActive: true, isPublished: true })
            .sort("-publishedAt")
            .limit(searchLimit)
            .select("title slug images.thumbnail category readTime");
    }

    if (!type || type === "festivals") {
        results.festivals = await Festival.find({ name: regex, isActive: true })
            .populate("stateId", "name slug")
            .sort("-priority")
            .limit(searchLimit)
            .select("name slug images.thumbnail month stateId");
    }

    return successResponse(res, 200, "Search results", { results, query: q });
});

// Search suggestions (lightweight)
export const suggestions = asyncHandler(async (req, res) => {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
        return successResponse(res, 200, "Suggestions", { suggestions: [] });
    }

    const regex = { $regex: q, $options: "i" };

    const [states, cities, places] = await Promise.all([
        State.find({ name: regex, isActive: true }).limit(3).select("name slug").lean(),
        City.find({ name: regex, isActive: true }).limit(3).select("name slug").lean(),
        TouristPlace.find({ name: regex, isActive: true }).limit(3).select("name slug").lean(),
    ]);

    const suggestions = [
        ...states.map((s) => ({ type: "state", name: s.name, slug: s.slug })),
        ...cities.map((c) => ({ type: "city", name: c.name, slug: c.slug })),
        ...places.map((p) => ({ type: "place", name: p.name, slug: p.slug })),
    ];

    return successResponse(res, 200, "Suggestions", { suggestions });
});
