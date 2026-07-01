import mongoose from "mongoose";

const historySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    actionType: {
      type: String,
      required: true,
      enum: ["VIEW_PLACE", "VIEW_CITY", "VIEW_STATE", "VIEW_FESTIVAL", "VIEW_BLOG", "SEARCH", "PLAN_TRIP"]
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      // Ref can be dynamic but for history it's easier to just store the ID and the model name
    },
    entityModel: {
      type: String,
      enum: ["Place", "City", "State", "Festival", "Blog", "SavedTrip", "Search"]
    },
    entityTitle: {
      type: String, // e.g. "Taj Mahal" or the search query
    },
    entityImage: {
      type: String // Optional: store an image URL for easy rendering without population
    },
    entitySlug: {
      type: String // Useful for linking
    }
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate consecutive entries (e.g. refreshing page)
// We will handle this logic in the controller rather than a unique index, 
// because a user might view the same place multiple times on different days.

const History = mongoose.model("History", historySchema);

export default History;
