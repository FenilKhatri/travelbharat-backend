import { asyncHandler } from "../../common/middlewares/async.helper.js";
import { successResponse, errorResponse } from "../../common/utils/responseHandler.utils.js";
import { generateUniqueSlug } from "../../common/utils/slug.utils.js";
import { ITEMS_PER_PAGE } from "../../common/utils/constants.js";
import { getPaginatedData } from "../../common/utils/pagination.utils.js";
import Restaurant from "./restaurant.model.js";

// PUBLIC
export const getRestaurants = asyncHandler(async (req, res) => {
    const { cityId, stateId, cuisine, priceRange, search, page = 1, limit = ITEMS_PER_PAGE } = req.query;
    
    const query = { isActive: true };
    if (cityId) query.cityId = cityId;
    if (stateId) query.stateId = stateId;
    if (cuisine) query.cuisines = cuisine;
    if (priceRange) query.priceRange = priceRange;
    if (search) query.name = { $regex: search, $options: "i" };

    const paginatedResult = await getPaginatedData(Restaurant, query, {
        page,
        limit,
        sort: "-priority -rating",
        populate: [
            { path: "cityId", select: "name slug" },
            { path: "stateId", select: "name slug" }
        ]
    });

    return successResponse(res, 200, "Restaurants fetched", {
        restaurants: paginatedResult.items,
        pagination: { 
            total: paginatedResult.totalItems, 
            page: paginatedResult.currentPage, 
            pages: paginatedResult.totalPages 
        }
    });
});

export const getRestaurantBySlug = asyncHandler(async (req, res) => {
    const restaurant = await Restaurant.findOne({ slug: req.params.slug, isActive: true })
        .populate("cityId", "name slug")
        .populate("stateId", "name slug");

    if (!restaurant) return errorResponse(res, 404, "Restaurant not found");
    return successResponse(res, 200, "Restaurant fetched", { restaurant });
});

// ADMIN
export const createRestaurant = asyncHandler(async (req, res) => {
    const slug = await generateUniqueSlug(Restaurant, req.body.name);
    const restaurant = await Restaurant.create({ ...req.body, slug });
    return successResponse(res, 201, "Restaurant created", { restaurant });
});

export const updateRestaurant = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (req.body.name) {
        req.body.slug = await generateUniqueSlug(Restaurant, req.body.name, id);
    }
    const restaurant = await Restaurant.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!restaurant) return errorResponse(res, 404, "Restaurant not found");
    return successResponse(res, 200, "Restaurant updated", { restaurant });
});

export const deleteRestaurant = asyncHandler(async (req, res) => {
    const restaurant = await Restaurant.findByIdAndDelete(req.params.id);
    if (!restaurant) return errorResponse(res, 404, "Restaurant not found");
    return successResponse(res, 200, "Restaurant deleted");
});
