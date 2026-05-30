export const ROLES = {
    USER: "user",
    ADMIN: "admin",
};

export const REVIEW_STATUS = {
    PENDING: "pending",
    APPROVED: "approved",
    REJECTED: "rejected",
};

export const CONTACT_STATUS = {
    NEW: "new",
    READ: "read",
    REPLIED: "replied",
    ARCHIVED: "archived",
};

export const PLACE_CATEGORIES = [
    "heritage", "nature", "temple", "beach", "hill-station",
    "wildlife", "adventure", "museum", "fort", "palace",
    "garden", "lake", "waterfall", "market", "religious",
    "modern", "other",
];

export const BLOG_CATEGORIES = [
    "travel-guide", "destination", "food", "culture",
    "adventure", "heritage", "festivals", "tips",
    "budget-travel", "luxury-travel", "wildlife",
    "spiritual", "other",
];

export const TRIP_TYPES = ["family", "couple", "solo", "friends", "pilgrim"];

export const BUDGET_TYPES = ["budget", "moderate", "luxury"];

export const REGIONS = ["north", "south", "east", "west", "central", "northeast"];

export const MAX_FAILED_ATTEMPTS = 5;

export const LOCK_TIME = 10 * 60 * 1000; // 10 minutes

export const ITEMS_PER_PAGE = 12;