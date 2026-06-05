import { asyncHandler } from "../../common/middlewares/async.helper.js";
import { successResponse, errorResponse } from "../../common/utils/responseHandler.utils.js";
import SavedItem from "./savedItem.model.js";
import TouristPlace from "../place/place.model.js";
import City from "../city/city.model.js";
import State from "../state/state.model.js";
import Festival from "../festival/festival.model.js";

export const toggleSaveItem = asyncHandler(async (req, res) => {
    const { itemId, itemType } = req.body;
    const userId = req.user.id;

    if (!["place", "city", "state", "festival"].includes(itemType)) {
        return errorResponse(res, 400, "Invalid item type");
    }

    const existingSave = await SavedItem.findOne({ itemId, itemType, userId });

    if (existingSave) {
        await SavedItem.findByIdAndDelete(existingSave._id);
        
        // Decrement count
        if (itemType === 'place') await TouristPlace.findByIdAndUpdate(itemId, { $inc: { saveCount: -1 } }).catch(()=>null);
        if (itemType === 'city') await City.findByIdAndUpdate(itemId, { $inc: { saveCount: -1 } }).catch(()=>null);
        if (itemType === 'state') await State.findByIdAndUpdate(itemId, { $inc: { saveCount: -1 } }).catch(()=>null);
        if (itemType === 'festival') await Festival.findByIdAndUpdate(itemId, { $inc: { saveCount: -1 } }).catch(()=>null);

        return successResponse(res, 200, "Item removed from saved", { isSaved: false });
    } else {
        await SavedItem.create({ itemId, itemType, userId });
        
        // Increment count
        if (itemType === 'place') await TouristPlace.findByIdAndUpdate(itemId, { $inc: { saveCount: 1 } }).catch(()=>null);
        if (itemType === 'city') await City.findByIdAndUpdate(itemId, { $inc: { saveCount: 1 } }).catch(()=>null);
        if (itemType === 'state') await State.findByIdAndUpdate(itemId, { $inc: { saveCount: 1 } }).catch(()=>null);
        if (itemType === 'festival') await Festival.findByIdAndUpdate(itemId, { $inc: { saveCount: 1 } }).catch(()=>null);

        return successResponse(res, 200, "Item saved", { isSaved: true });
    }
});

export const getSavedItems = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { itemType } = req.query; // optional filter

    const query = { userId };
    if (itemType) query.itemType = itemType;

    const saved = await SavedItem.find(query).sort("-createdAt");
    return successResponse(res, 200, "Saved items fetched", { saved });
});

export const checkSavedStatus = asyncHandler(async (req, res) => {
    const { itemId, itemType } = req.params;
    const userId = req.user.id;

    const existingSave = await SavedItem.findOne({ itemId, itemType, userId });
    return successResponse(res, 200, "Checked status", { isSaved: !!existingSave });
});
