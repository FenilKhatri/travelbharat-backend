import { asyncHandler } from "../../common/middlewares/async.helper.js";
import { successResponse, errorResponse } from "../../common/utils/responseHandler.utils.js";
import { generateUniqueSlug } from "../../common/utils/slug.utils.js";
import { ITEMS_PER_PAGE } from "../../common/utils/constants.js";
import Hotel from "./hotel.model.js";

// PUBLIC
export const getHotels = asyncHandler(async (req, res) => {
    const { cityId, stateId, starRating, propertyType, budget, search, page = 1, limit = ITEMS_PER_PAGE } = req.query;
    
    const query = { isActive: true };
    if (cityId) query.cityId = cityId;
    if (stateId) query.stateId = stateId;
    if (starRating) query.starRating = parseInt(starRating);
    if (propertyType) query.propertyType = propertyType;
    if (budget) query.budget = budget;
    if (search) query.name = { $regex: search, $options: "i" };

    const total = await Hotel.countDocuments(query);
    const hotels = await Hotel.find(query)
        .populate("cityId", "name slug")
        .populate("stateId", "name slug")
        .sort("-priority -rating")
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    return successResponse(res, 200, "Hotels fetched", {
        hotels,
        pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) }
    });
});

export const getHotelBySlug = asyncHandler(async (req, res) => {
    const hotel = await Hotel.findOne({ slug: req.params.slug, isActive: true })
        .populate("cityId", "name slug")
        .populate("stateId", "name slug");

    if (!hotel) return errorResponse(res, 404, "Hotel not found");
    return successResponse(res, 200, "Hotel fetched", { hotel });
});

// ADMIN
export const createHotel = asyncHandler(async (req, res) => {
    const slug = await generateUniqueSlug(Hotel, req.body.name);
    const hotel = await Hotel.create({ ...req.body, slug });
    return successResponse(res, 201, "Hotel created", { hotel });
});

export const updateHotel = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (req.body.name) {
        req.body.slug = await generateUniqueSlug(Hotel, req.body.name, id);
    }
    const hotel = await Hotel.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!hotel) return errorResponse(res, 404, "Hotel not found");
    return successResponse(res, 200, "Hotel updated", { hotel });
});

export const deleteHotel = asyncHandler(async (req, res) => {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);
    if (!hotel) return errorResponse(res, 404, "Hotel not found");
    return successResponse(res, 200, "Hotel deleted");
});
