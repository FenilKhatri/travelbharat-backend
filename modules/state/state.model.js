import mongoose from "mongoose";
import { generateSlug } from "../../common/utils/slug.utils.js";

const stateSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "State name is required"],
            trim: true,
            unique: true,
        },
        slug: {
            type: String,
            unique: true,
            index: true,
        },
        stateCode: {
            type: String,
            trim: true,
            uppercase: true,
        },
        isUnionTerritory: {
            type: Boolean,
            default: false,
        },
        region: {
            type: String,
            enum: ["north", "south", "east", "west", "central", "northeast", "island"],
            required: true,
        },
        tagline: {
            type: String,
            trim: true,
        },
        capital: {
            type: String,
            required: true,
        },
        area: {
            type: Number, // in sq km
        },
        population: {
            type: Number,
        },
        languages: [
            {
                type: String,
                trim: true,
            },
        ],
        mapCoordinates: {
            type: { type: String, enum: ["Point"], default: "Point" },
            coordinates: { type: [Number] }, // [longitude, latitude]
        },
        
        // 1. Hero
        heroDescription: {
            type: String,
            trim: true,
            default: "", // Will be populated in migration from description
        },
        ctaLabel: {
            type: String,
            default: "Explore State",
            trim: true,
        },
        
        // 2. Quick Facts (Presentation layer)
        quickFacts: {
            type: Map,
            of: String
        },

        // 3. Why Visit
        whyVisit: [
            {
                title: String,
                description: String,
                icon: String,
                image: { url: String, publicId: String, altText: String },
            }
        ],

        // 4. Discover Sections
        discoverSections: [
            {
                title: String,
                subtitle: String,
                icon: String,
                image: { url: String, publicId: String, altText: String },
                description: String,
                order: { type: Number, default: 0 }
            }
        ],

        // 5. History Timeline
        historyTimeline: [
            {
                year: String,
                title: String,
                description: String,
                image: { url: String, publicId: String, altText: String },
                order: { type: Number, default: 0 }
            }
        ],

        // 6. Experiences
        experiences: [
            {
                title: String,
                description: String,
                icon: String,
                category: String,
                image: { url: String, publicId: String, altText: String },
            }
        ],

        // 7. Featured Attractions (FK)
        featuredAttractions: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "TouristPlace"
            }
        ],

        // 8. Featured Festivals (FK)
        featuredFestivals: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Festival"
            }
        ],

        // 9. Featured Cuisine (FK)
        featuredCuisine: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Food"
            }
        ],

        // 10. Wildlife Highlights
        wildlifeHighlights: [
            {
                title: String,
                description: String,
                image: { url: String, publicId: String, altText: String },
                icon: String,
            }
        ],

        // 11. Seasons
        seasons: [
            {
                season: String, // e.g. "Summer", "Winter", "Monsoon"
                months: String, // e.g. "April - June"
                temperature: String, // e.g. "25°C - 40°C"
                recommended: { type: Boolean, default: false },
                description: String,
            }
        ],

        // 12. Travel Info
        travelInfo: {
            byAir: String,
            byTrain: String,
            byRoad: String,
            localTransport: String,
            airport: String,
            nearestMajorCity: String,
        },

        // 13. Travel Tips
        travelTips: [
            {
                icon: String,
                title: String,
                description: String,
            }
        ],

        // 14. Fun Facts
        funFacts: [{ type: String }],

        // 15. FAQ
        faq: [
            {
                question: String,
                answer: String,
            }
        ],

        // 16. Nearby States (FK)
        nearbyStates: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "State"
            }
        ],

        images: {
            hero: { url: String, publicId: String, altText: String },
            thumbnail: { url: String, publicId: String, altText: String },
        },
        
        // 17. Categorized Gallery
        gallery: [
            {
                url: String, 
                publicId: String, 
                altText: String,
                category: {
                    type: String,
                    enum: [
                        "hero", "landscape", "heritage", "wildlife", "cuisine", 
                        "festivals", "adventure", "cities", "people", 
                        "spirituality", "architecture", "culture"
                    ],
                    default: "landscape"
                },
                priority: { type: Number, default: 0 },
                featured: { type: Boolean, default: false }
            }
        ],

        stateBranding: {
            leftBackground: { url: String, publicId: String },
            rightBackground: { url: String, publicId: String },
            patternImage: { url: String, publicId: String },
            overlayImage: { url: String, publicId: String },
            primaryColor: String,
        },

        seo: {
            metaTitle: { type: String, trim: true },
            metaDescription: { type: String, trim: true },
            keywords: [{ type: String, trim: true }],
        },
        
        badges: [{ type: String }],
        primaryBadge: { type: String },
        featured: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true, index: true },
        priority: { type: Number, default: 0 },
        
        totalCities: { type: Number, default: 0 },
        totalPlaces: { type: Number, default: 0 },
        likeCount: { type: Number, default: 0 },
        
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

        _legacy_description: String,
        _legacy_overview: String,
        _legacy_history: String,
        _legacy_culture: String,
        _legacy_weather: {
            summer: String,
            winter: String,
            monsoon: String,
            bestSeason: String,
        },
        _legacy_transport: {
            byAir: String,
            byTrain: String,
            byRoad: String,
            local: String,
        },
        _legacy_highlights: [{ title: String, description: String, icon: String }],
        _legacy_travelTips: [{ type: String }]
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Slug Generation
stateSchema.pre("validate", function (next) {
    if (this.name && !this.slug) {
        this.slug = generateSlug(this.name);
    }
    next();
});

// Virtual Relations
stateSchema.virtual("cities", {
    ref: "City",
    localField: "_id",
    foreignField: "stateId",
});

stateSchema.virtual("festivals", {
    ref: "Festival",
    localField: "_id",
    foreignField: "stateIds",
});

stateSchema.virtual("foods", {
    ref: "Food",
    localField: "_id",
    foreignField: "stateIds",
});

// Indexes
stateSchema.index({ region: 1, isActive: 1 });
stateSchema.index({ featured: 1, priority: -1 });
stateSchema.index({
    name: "text",
    tagline: "text",
    heroDescription: "text",
});
stateSchema.index({ stateCode: 1 }, { sparse: true });


const State = mongoose.model("State", stateSchema);

export default State;
