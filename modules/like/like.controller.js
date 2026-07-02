import { asyncHandler } from "../../common/middlewares/async.helper.js";
import { successResponse, errorResponse } from "../../common/utils/responseHandler.utils.js";
import UniversalLike from "./like.model.js";
import State from "../state/state.model.js";
import City from "../city/city.model.js";
import TouristPlace from "../place/place.model.js";
import Blog from "../blog/blog.model.js";
import Festival from "../festival/festival.model.js";
import Notification from "../notification/notification.model.js";
import Food from "../food/food.model.js";
import Hotel from "../hotel/hotel.model.js";
import Restaurant from "../restaurant/restaurant.model.js";
import Activity from "../activity/activity.model.js";

const MODEL_MAP = {
    state: State,
    city: City,
    place: TouristPlace,
    blog: Blog,
    festival: Festival,
    food: Food,
    hotel: Hotel,
    restaurant: Restaurant,
    activity: Activity,
};

const MODEL_NAME_MAP = {
    state: "State",
    city: "City",
    place: "TouristPlace",
    blog: "Blog",
    festival: "Festival",
    food: "Food",
    hotel: "Hotel",
    restaurant: "Restaurant",
    activity: "Activity",
};

export const toggleLike = asyncHandler(async (req, res) => {
    const { entityType, entityId } = req.body;
    
    if (!entityType || !entityId) {
        return errorResponse(res, 400, "Entity type and ID are required");
    }

    if (!MODEL_MAP[entityType]) {
        return errorResponse(res, 400, "Invalid entity type");
    }

    const Model = MODEL_MAP[entityType];
    const entityModelName = MODEL_NAME_MAP[entityType];

    const entityExists = await Model.findById(entityId);
    if (!entityExists) {
        return errorResponse(res, 404, `${entityType} not found`);
    }

    const existingLike = await UniversalLike.findOne({
        userId: req.user.id,
        entityType,
        entityId,
    });

    if (existingLike) {
        await existingLike.deleteOne();
        
        const updateField = entityExists.likeCount !== undefined ? "likeCount" : "likes";
        
        const updatedEntity = await Model.findByIdAndUpdate(
            entityId,
            { $inc: { [updateField]: -1 } },
            { new: true }
        );

        return successResponse(res, 200, "Like removed", { 
            isLiked: false,
            likeCount: updatedEntity[updateField] < 0 ? 0 : updatedEntity[updateField]
        });
    } else {
        await UniversalLike.create({
            userId: req.user.id,
            entityType,
            entityId,
            entityModel: entityModelName,
        });
        
        const updateField = entityExists.likeCount !== undefined ? "likeCount" : "likes";

        const updatedEntity = await Model.findByIdAndUpdate(
            entityId,
            { $inc: { [updateField]: 1 } },
            { new: true }
        );

        await Notification.create({
            user: req.user.id,
            title: "Item Liked",
            message: `You have successfully liked ${entityExists.name || entityExists.title}. You can find it in your liked items.`,
            type: "system",
            link: "/user/likes"
        });

        return successResponse(res, 200, "Like added", { 
            isLiked: true,
            likeCount: updatedEntity[updateField]
        });
    }
});

export const getLikedItems = asyncHandler(async (req, res) => {
    const { type } = req.query; // optional filter
    const query = { userId: req.user.id };
    if (type) query.entityType = type;

    const likes = await UniversalLike.find(query)
        .populate("entityId")
        .sort("-createdAt");

    return successResponse(res, 200, "Liked items fetched", { likes });
});

export const checkLikeStatus = asyncHandler(async (req, res) => {
    const { entityType, entityId } = req.params;
    const userId = req.user.id;

    if (!entityType || !entityId) {
        return errorResponse(res, 400, "Entity type and ID are required");
    }

    const existingLike = await UniversalLike.findOne({
        userId,
        entityType,
        entityId,
    });

    return successResponse(res, 200, "Checked status", { isLiked: !!existingLike });
});
