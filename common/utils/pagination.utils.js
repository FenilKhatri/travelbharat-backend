export const getPaginatedData = async (model, query = {}, options = {}) => {
    const page = parseInt(options.page, 10) || 1;
    const limit = parseInt(options.limit, 10) || 10;
    const sort = options.sort || '-createdAt';
    const select = options.select || '';
    
    // Normalize populate option to always be an array
    let populateList = [];
    if (options.populate) {
        if (Array.isArray(options.populate)) {
            populateList = options.populate;
        } else {
            populateList = [options.populate];
        }
    }

    const totalItems = await model.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = page;
    const hasNextPage = currentPage < totalPages;

    let dbQuery = model.find(query)
        .sort(sort)
        .skip((currentPage - 1) * limit)
        .limit(limit)
        .select(select);

    if (populateList.length > 0) {
        populateList.forEach(p => {
            dbQuery = dbQuery.populate(p);
        });
    }

    const items = await dbQuery;

    return {
        items,
        totalItems,
        totalPages,
        currentPage,
        hasNextPage
    };
};
