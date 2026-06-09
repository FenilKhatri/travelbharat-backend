import { asyncHandler } from "../../common/middlewares/async.helper.js";
import { successResponse, errorResponse } from "../../common/utils/responseHandler.utils.js";
import Accommodation from "./accommodation.model.js";

// Get all accommodations by destination Id
export const getAccommodationsByDestination = asyncHandler(async (req, res) => {
    const { destinationId } = req.params;
    
    if (!destinationId) {
        return errorResponse(res, 400, "Destination ID is required");
    }

    const accommodations = await Accommodation.find({ 
        destinationId,
        isActive: true 
    }).sort("-rating");

    return successResponse(res, 200, "Accommodations fetched successfully", { accommodations });
});

// Create accommodation (Admin)
export const createAccommodation = asyncHandler(async (req, res) => {
    const accommodation = await Accommodation.create(req.body);
    return successResponse(res, 201, "Accommodation created successfully", { accommodation });
});
