import { asyncHandler } from "../../common/middlewares/async.helper.js";
import { successResponse, errorResponse } from "../../common/utils/responseHandler.utils.js";
import History from "./history.model.js";

// Add history record
export const addHistory = asyncHandler(async (req, res) => {
  const { actionType, entityId, entityModel, entityTitle, entityImage, entitySlug } = req.body;
  const userId = req.user.id;

  const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
  const recentHistory = await History.findOne({
    userId,
    actionType,
    entityTitle,
    createdAt: { $gte: fiveMinsAgo }
  });

  if (recentHistory) {
    return successResponse(res, 200, "History already logged recently");
  }

  const history = await History.create({
    userId,
    actionType,
    entityId,
    entityModel,
    entityTitle,
    entityImage,
    entitySlug
  });

  return successResponse(res, 201, "History added", { history });
});

// Get user history
export const getMyHistory = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  
  const history = await History.find({ userId: req.user.id })
    .sort("-createdAt")
    .limit(limit);

  return successResponse(res, 200, "History fetched", { history });
});

// Clear user history
export const clearHistory = asyncHandler(async (req, res) => {
  await History.deleteMany({ userId: req.user.id });
  return successResponse(res, 200, "History cleared");
});
