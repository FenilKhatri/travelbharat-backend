import { asyncHandler } from "../../common/middlewares/async.helper.js";
import { successResponse, errorResponse } from "../../common/utils/responseHandler.utils.js";
import { generateUniqueSlug } from "../../common/utils/slug.utils.js";
import { ITEMS_PER_PAGE } from "../../common/utils/constants.js";
import Activity from "./activity.model.js";

// PUBLIC
export const getActivities = asyncHandler(async (req, res) => {
    const { stateId, placeId, category, difficulty, search, page = 1, limit = ITEMS_PER_PAGE } = req.query;
    
    const query = { isActive: true };
    if (stateId) query.stateIds = stateId; // stateIds is an array
    if (placeId) query.placeIds = placeId; // placeIds is an array
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (search) query.name = { $regex: search, $options: "i" };

    const total = await Activity.countDocuments(query);
    const activities = await Activity.find(query)
        .populate("stateIds", "name slug")
        .populate("placeIds", "name slug")
        .sort("-priority -rating")
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    return successResponse(res, 200, "Activities fetched", {
        activities,
        pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) }
    });
});

export const getActivityBySlug = asyncHandler(async (req, res) => {
    const activity = await Activity.findOne({ slug: req.params.slug, isActive: true })
        .populate("stateIds", "name slug")
        .populate("placeIds", "name slug");

    if (!activity) return errorResponse(res, 404, "Activity not found");
    return successResponse(res, 200, "Activity fetched", { activity });
});

// ADMIN
export const createActivity = asyncHandler(async (req, res) => {
    const slug = await generateUniqueSlug(Activity, req.body.name);
    const activity = await Activity.create({ ...req.body, slug });
    return successResponse(res, 201, "Activity created", { activity });
});

export const updateActivity = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (req.body.name) {
        req.body.slug = await generateUniqueSlug(Activity, req.body.name, id);
    }
    const activity = await Activity.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!activity) return errorResponse(res, 404, "Activity not found");
    return successResponse(res, 200, "Activity updated", { activity });
});

export const deleteActivity = asyncHandler(async (req, res) => {
    const activity = await Activity.findByIdAndDelete(req.params.id);
    if (!activity) return errorResponse(res, 404, "Activity not found");
    return successResponse(res, 200, "Activity deleted");
});
