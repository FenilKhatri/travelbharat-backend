import { asyncHandler } from "../../common/middlewares/async.helper.js";
import { successResponse, errorResponse } from "../../common/utils/responseHandler.utils.js";
import Wishlist from "./wishlist.model.js";

// Get user's wishlist
export const getWishlist = asyncHandler(async (req, res) => {
    let wishlist = await Wishlist.findOne({ userId: req.user.id })
        .populate("places", "name slug images.thumbnail category rating stateId cityId")
        .populate("blogs", "title slug images.thumbnail category readTime");

    if (!wishlist) {
        wishlist = await Wishlist.create({ userId: req.user.id });
    }

    return successResponse(res, 200, "Wishlist fetched", { wishlist });
});

// Toggle place in wishlist
export const togglePlace = asyncHandler(async (req, res) => {
    const { placeId } = req.body;
    if (!placeId) return errorResponse(res, 400, "Place ID is required");

    let wishlist = await Wishlist.findOne({ userId: req.user.id });
    if (!wishlist) {
        wishlist = await Wishlist.create({ userId: req.user.id });
    }

    const index = wishlist.places.indexOf(placeId);
    if (index > -1) {
        wishlist.places.splice(index, 1);
        await wishlist.save();
        return successResponse(res, 200, "Place removed from wishlist", { wishlist, action: "removed" });
    } else {
        wishlist.places.push(placeId);
        await wishlist.save();
        return successResponse(res, 200, "Place added to wishlist", { wishlist, action: "added" });
    }
});

// Toggle blog in wishlist
export const toggleBlog = asyncHandler(async (req, res) => {
    const { blogId } = req.body;
    if (!blogId) return errorResponse(res, 400, "Blog ID is required");

    let wishlist = await Wishlist.findOne({ userId: req.user.id });
    if (!wishlist) {
        wishlist = await Wishlist.create({ userId: req.user.id });
    }

    const index = wishlist.blogs.indexOf(blogId);
    if (index > -1) {
        wishlist.blogs.splice(index, 1);
        await wishlist.save();
        return successResponse(res, 200, "Blog removed from wishlist", { wishlist, action: "removed" });
    } else {
        wishlist.blogs.push(blogId);
        await wishlist.save();
        return successResponse(res, 200, "Blog added to wishlist", { wishlist, action: "added" });
    }
});

// Check if item is in wishlist
export const checkWishlist = asyncHandler(async (req, res) => {
    const { placeId, blogId } = req.query;
    const wishlist = await Wishlist.findOne({ userId: req.user.id });

    const result = {
        isPlaceWishlisted: placeId ? wishlist?.places?.includes(placeId) || false : false,
        isBlogWishlisted: blogId ? wishlist?.blogs?.includes(blogId) || false : false,
    };

    return successResponse(res, 200, "Wishlist status", result);
});
