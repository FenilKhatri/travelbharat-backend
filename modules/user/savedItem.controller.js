import { asyncHandler } from "../../common/middlewares/async.helper.js";
import { successResponse, errorResponse } from "../../common/utils/responseHandler.utils.js";
import SavedItem from "./savedItem.model.js";
import TouristPlace from "../place/place.model.js";
import City from "../city/city.model.js";
import State from "../state/state.model.js";
import Festival from "../festival/festival.model.js";
import Blog from "../blog/blog.model.js";
import Food from "../food/food.model.js";
import Hotel from "../hotel/hotel.model.js";
import Restaurant from "../restaurant/restaurant.model.js";
import Activity from "../activity/activity.model.js";
import Tag from "../tag/tag.model.js";

const MODEL_MAP = {
    place: TouristPlace,
    city: City,
    state: State,
    festival: Festival,
    blog: Blog,
    food: Food,
    hotel: Hotel,
    restaurant: Restaurant,
    activity: Activity,
    tag: Tag
};

const MODEL_NAME_MAP = {
    place: "TouristPlace",
    city: "City",
    state: "State",
    festival: "Festival",
    blog: "Blog",
    food: "Food",
    hotel: "Hotel",
    restaurant: "Restaurant",
    activity: "Activity",
    tag: "Tag"
};

export const toggleSaveItem = asyncHandler(async (req, res) => {
    const { itemId, itemType } = req.body;
    const userId = req.user.id;

    if (!MODEL_MAP[itemType]) {
        return errorResponse(res, 400, "Invalid item type");
    }

    const Model = MODEL_MAP[itemType];
    const itemModelName = MODEL_NAME_MAP[itemType];

    const existingSave = await SavedItem.findOne({ itemId, itemType, userId });

    if (existingSave) {
        await SavedItem.findByIdAndDelete(existingSave._id);
        
        // Decrement count
        await Model.findByIdAndUpdate(itemId, { $inc: { saveCount: -1 } }).catch(()=>null);

        return successResponse(res, 200, "Item removed from saved", { isSaved: false });
    } else {
        await SavedItem.create({ itemId, itemType, userId, itemModel: itemModelName });
        
        // Increment count
        await Model.findByIdAndUpdate(itemId, { $inc: { saveCount: 1 } }).catch(()=>null);

        return successResponse(res, 200, "Item saved", { isSaved: true });
    }
});

export const getSavedItems = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { itemType } = req.query; // optional filter

    const query = { userId };
    if (itemType) query.itemType = itemType;

    const saved = await SavedItem.find(query)
        .populate("itemId") // Assumes itemId refs are properly handled by mongoose dynamic ref, though refPath is better for polymorphism
        .sort("-createdAt");
        
    return successResponse(res, 200, "Saved items fetched", { saved });
});

export const checkSavedStatus = asyncHandler(async (req, res) => {
    const { itemId, itemType } = req.params;
    const userId = req.user.id;

    const existingSave = await SavedItem.findOne({ itemId, itemType, userId });
    return successResponse(res, 200, "Checked status", { isSaved: !!existingSave });
});
