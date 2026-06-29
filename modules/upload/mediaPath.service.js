const BASE_FOLDER = "travelbharat";

const toSlug = (text) => {
    if (!text) return "";
    return text.toString().toLowerCase().trim().replace(/[\s\W-]+/g, "-").replace(/^-+|-+$/g, "");
};

export const getMediaPath = (params) => {
    const {
        entityType,
        entityId,
        subEntity,
        subEntityId,
        subSubEntity,
        subSubEntityId,
        category,
    } = params;

    let path = [BASE_FOLDER];

    switch (entityType) {
        case "user":
            if (!entityId) throw new Error("userId is required for user media");
            path.push("users", toSlug(entityId));
            if (subEntity === "trip") {
                if (!subEntityId) throw new Error("tripId is required for trip media");
                path.push("trips", toSlug(subEntityId));
            }
            if (category) path.push(toSlug(category));
            break;

        case "state":
            if (!entityId) throw new Error("stateSlug is required for state media");
            path.push("states", toSlug(entityId));

            if (subEntity === "city") {
                if (!subEntityId) throw new Error("citySlug is required for city media");
                path.push("cities", toSlug(subEntityId));
                
                if (subSubEntity === "destination") {
                    if (!subSubEntityId) throw new Error("destinationSlug is required for destination media");
                    path.push("destinations", toSlug(subSubEntityId));
                } else if (subSubEntity) {
                    // e.g., 'foods', 'festivals' at city level
                    path.push(toSlug(subSubEntity));
                    if (subSubEntityId) path.push(toSlug(subSubEntityId)); // e.g. 'locho'
                } else {
                    path.push("city"); // e.g. state/gujarat/cities/surat/city/hero
                }
            } else if (subEntity) {
                 // e.g., 'festivals', 'foods' at state level
                 path.push(toSlug(subEntity));
                 if (subEntityId) path.push(toSlug(subEntityId)); // e.g. 'navratri'
            }
            if (category && category !== "state" && category !== "city" && category !== "hero") {
                path.push(toSlug(category));
            }
            break;

        case "blog":
        case "hotel":
        case "experience":
            path.push(`${toSlug(entityType)}s`);
            if (entityId) path.push(toSlug(entityId));
            if (category) path.push(toSlug(category));
            break;

        default:
            path.push("temp");
            if (category) path.push(toSlug(category));
            break;
    }

    return path.join("/");
};
