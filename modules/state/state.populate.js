export const publicStatePopulate = [
    {
        path: "featuredAttractions.place",
        select: "name slug images.thumbnail category rating reviewCount",
    },
    {
        path: "featuredFestivals.festival",
        select: "name slug images.thumbnail month category",
    },
    {
        path: "featuredCuisine.food",
        select: "name slug image cuisine isVeg",
    },
    {
        path: "nearbyStates",
        select: "name slug images.thumbnail tagline region",
    }
];

export const adminStatePopulate = [
    {
        path: "featuredAttractions.place",
        select: "name slug images.thumbnail category rating reviewCount",
    },
    {
        path: "featuredFestivals.festival",
        select: "name slug images.thumbnail month category",
    },
    {
        path: "featuredCuisine.food",
        select: "name slug image cuisine isVeg",
    },
    {
        path: "nearbyStates",
        select: "name slug images.thumbnail tagline region",
    },
    {
        path: "createdBy",
        select: "name email avatar",
    },
    {
        path: "updatedBy",
        select: "name email avatar",
    }
];
