/**
 * Generate a URL-friendly slug from a string
 */
export const generateSlug = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[\s_]+/g, "-")         // Replace spaces and underscores with hyphens
        .replace(/[^\w\-]+/g, "")        // Remove non-word chars (except hyphens)
        .replace(/\-\-+/g, "-")          // Replace multiple hyphens with single
        .replace(/^-+/, "")              // Trim hyphens from start
        .replace(/-+$/, "");             // Trim hyphens from end
};

/**
 * Generate a unique slug by appending a counter if needed
 */
export const generateUniqueSlug = async (Model, text, existingId = null) => {
    let slug = generateSlug(text);
    let counter = 0;
    let finalSlug = slug;

    while (true) {
        const query = { slug: finalSlug };
        if (existingId) {
            query._id = { $ne: existingId };
        }
        const existing = await Model.findOne(query);
        if (!existing) break;
        counter++;
        finalSlug = `${slug}-${counter}`;
    }

    return finalSlug;
};
