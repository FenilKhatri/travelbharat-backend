import { asyncHandler } from "../../common/middlewares/async.helper.js";
import { successResponse, errorResponse } from "../../common/utils/responseHandler.utils.js";
import { generateUniqueSlug } from "../../common/utils/slug.utils.js";
import { ITEMS_PER_PAGE } from "../../common/utils/constants.js";
import { getPaginatedData } from "../../common/utils/pagination.utils.js";
import Tag from "./tag.model.js";

// PUBLIC
export const getTags = asyncHandler(async (req, res) => {
    const { search, isFeatured, page = 1, limit = ITEMS_PER_PAGE } = req.query;
    
    const query = { isActive: true };
    if (isFeatured === "true") query.isFeatured = true;
    if (search) query.name = { $regex: search, $options: "i" };

    const paginatedResult = await getPaginatedData(Tag, query, {
        page,
        limit,
        sort: "-priority"
    });

    return successResponse(res, 200, "Tags fetched", {
        tags: paginatedResult.items,
        pagination: { 
            total: paginatedResult.totalItems, 
            page: paginatedResult.currentPage, 
            pages: paginatedResult.totalPages 
        }
    });
});

export const getTagBySlug = asyncHandler(async (req, res) => {
    const tag = await Tag.findOne({ slug: req.params.slug, isActive: true });
    if (!tag) return errorResponse(res, 404, "Tag not found");
    return successResponse(res, 200, "Tag fetched", { tag });
});

// ADMIN
export const createTag = asyncHandler(async (req, res) => {
    const slug = await generateUniqueSlug(Tag, req.body.name);
    const tag = await Tag.create({ ...req.body, slug });
    return successResponse(res, 201, "Tag created", { tag });
});

export const updateTag = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (req.body.name) {
        req.body.slug = await generateUniqueSlug(Tag, req.body.name, id);
    }
    const tag = await Tag.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!tag) return errorResponse(res, 404, "Tag not found");
    return successResponse(res, 200, "Tag updated", { tag });
});

export const deleteTag = asyncHandler(async (req, res) => {
    const tag = await Tag.findByIdAndDelete(req.params.id);
    if (!tag) return errorResponse(res, 404, "Tag not found");
    return successResponse(res, 200, "Tag deleted");
});
