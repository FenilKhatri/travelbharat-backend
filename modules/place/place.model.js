import mongoose from "mongoose";

const placeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            index: true,
        },

        stateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "State",
            required: true,
            index: true,
        },

        cityId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "City",
            required: true,
            index: true,
        },

        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            index: true,
        },

        // ----------------------
        // BASIC CONTENT
        // ----------------------

        description: {
            type: String,
            required: true,
        },

        overview: {
            type: String,
            default: "",
        },

        history: {
            type: String,
            default: "",
        },

        legends: {
            type: String,
            default: "",
        },

        whyVisit: {
            type: String,
            default: "",
        },

        // ----------------------
        // IMAGES
        // ----------------------

        images: {
            hero: {
                type: String,
                default: "",
            },

            thumbnail: {
                type: String,
                default: "",
            },

            gallery: [
                {
                    type: String,
                },
            ],
        },

        // ----------------------
        // LOCATION
        // ----------------------

        location: {
            address: {
                type: String,
                default: "",
            },

            coordinates: {
                lat: {
                    type: Number,
                    default: 0,
                },

                lng: {
                    type: Number,
                    default: 0,
                },
            },
        },

        // ----------------------
        // VISITOR INFORMATION
        // ----------------------

        timings: {
            type: String,
            default: "Open 24 Hours",
        },

        closedOn: {
            type: String,
            default: "Open All Days",
        },

        duration: {
            type: String,
            default: "",
        },

        bestTimeToVisit: {
            type: String,
            default: "",
        },

        entryFee: {
            indian: {
                type: String,
                default: "Free",
            },

            foreigner: {
                type: String,
                default: "Free",
            },

            camera: {
                type: String,
                default: "Free",
            },
        },

        // ----------------------
        // QUICK FACTS
        // ----------------------

        quickFacts: {
            distanceFromCity: {
                type: String,
                default: "",
            },

            famousFor: {
                type: String,
                default: "",
            },

            idealDuration: {
                type: String,
                default: "",
            },

            nearestAirport: {
                type: String,
                default: "",
            },

            nearestRailwayStation: {
                type: String,
                default: "",
            },
        },

        // ----------------------
        // HIGHLIGHTS
        // ----------------------

        highlights: [
            {
                title: String,
                description: String,
                icon: String,
            },
        ],

        // ----------------------
        // ACTIVITIES
        // ----------------------

        activities: [
            {
                name: String,
                description: String,
                image: String,
            },
        ],

        // ----------------------
        // TRAVEL TIPS
        // ----------------------

        tips: [
            {
                type: String,
            },
        ],

        // ----------------------
        // FOOD
        // ----------------------

        foodSpecialities: [
            {
                name: String,
                description: String,
                image: String,
            },
        ],

        // ----------------------
        // PHOTOGRAPHY
        // ----------------------

        photographySpots: [
            {
                title: String,
                description: String,
            },
        ],

        // ----------------------
        // HOW TO REACH
        // ----------------------

        howToReach: {
            byAir: {
                type: String,
                default: "",
            },

            byTrain: {
                type: String,
                default: "",
            },

            byRoad: {
                type: String,
                default: "",
            },

            localTransport: {
                type: String,
                default: "",
            },
        },

        // ----------------------
        // NEARBY ATTRACTIONS
        // ----------------------

        nearbyAttractions: [
            {
                name: String,
                distance: String,
                image: String,
            },
        ],

        // ----------------------
        // VISITOR TYPES
        // ----------------------

        suitableFor: [
            {
                type: String,
                enum: [
                    "family",
                    "couple",
                    "solo",
                    "friends",
                    "photographers",
                    "pilgrims",
                    "adventure-lovers",
                ],
            },
        ],

        tripType: [
            {
                type: String,
                enum: [
                    "family",
                    "couple",
                    "solo",
                    "friends",
                    "pilgrim",
                ],
            },
        ],

        // ----------------------
        // RATING
        // ----------------------

        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },

        reviewCount: {
            type: Number,
            default: 0,
        },

        // ----------------------
        // CATEGORY
        // ----------------------

        category: {
            type: String,
            enum: [
                "heritage",
                "nature",
                "temple",
                "beach",
                "hill-station",
                "wildlife",
                "adventure",
                "museum",
                "fort",
                "palace",
                "garden",
                "lake",
                "waterfall",
                "market",
                "religious",
                "modern",
                "other",
            ],
            default: "other",
            index: true,
        },

        budget: {
            type: String,
            enum: [
                "budget",
                "moderate",
                "luxury",
            ],
            default: "moderate",
        },

        // ----------------------
        // FLAGS
        // ----------------------

        featured: {
            type: Boolean,
            default: false,
            index: true,
        },

        trending: {
            type: Boolean,
            default: false,
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        priority: {
            type: Number,
            default: 0,
            index: true,
        },

        // ----------------------
        // SEO
        // ----------------------

        seo: {
            metaTitle: {
                type: String,
                default: "",
            },

            metaDescription: {
                type: String,
                default: "",
            },

            keywords: [
                {
                    type: String,
                },
            ],
        },
    },
    {
        timestamps: true,
    }
);

placeSchema.pre("validate", function (next) {
    if (this.isModified("name") && !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
    }

    next();
});

export default mongoose.model("TouristPlace", placeSchema);