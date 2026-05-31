import { asyncHandler } from "../../common/middlewares/async.helper.js";
import { successResponse, errorResponse } from "../../common/utils/responseHandler.utils.js";
import UniversalLike from "./like.model.js";
import State from "../state/state.model.js";
import City from "../city/city.model.js";
import TouristPlace from "../place/place.model.js";
import Blog from "../blog/blog.model.js";

const MODEL_MAP = {
    state: State,
    city: City,
    destination: TouristPlace,
    blog: Blog,
};

const MODEL_NAME_MAP = {
    state: "State",
    city: "City",
    destination: "TouristPlace",
    blog: "Blog",
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
        if (entityExists.likeCount !== undefined) {
             entityExists.likeCount = Math.max(0, entityExists.likeCount - 1);
        } else if (entityExists.likes !== undefined) {
             entityExists.likes = Math.max(0, entityExists.likes - 1);
        }
        await entityExists.save();
        return successResponse(res, 200, "Like removed", { isLiked: false });
    } else {
        await UniversalLike.create({
            userId: req.user.id,
            entityType,
            entityId,
            entityModel: entityModelName,
        });
        if (entityExists.likeCount !== undefined) {
             entityExists.likeCount += 1;
        } else if (entityExists.likes !== undefined) {
             entityExists.likes += 1;
        }
        await entityExists.save();
        return successResponse(res, 200, "Like added", { isLiked: true });
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
