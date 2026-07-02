import City from "./city.model.js";
import State from "../state/state.model.js";
import TouristPlace from "../place/place.model.js";
import { generateUniqueSlug } from "../../common/utils/slug.utils.js";

class CityService {
    async getCityByStateAndSlug(stateSlug, citySlug) {
        const state = await State.findOne({ slug: stateSlug, isActive: true });
        if (!state) {
            return null;
        }

        const city = await City.findOne({ slug: citySlug, stateId: state._id, isActive: true })
            .populate("stateId", "name slug languages travelTips")
            .populate("destinations", "name slug images.thumbnail category rating reviewCount description entryFee timings duration priority isActive");
            
        return city;
    }

    whitelistData(body) {
        const allowedFields = [
            "name", "stateId", "district", "type", "tagline", "description",
            "overview", "images", "transport", "emergencyInfo", "nearbyPlaces",
            "mapCoordinates", "population", "pincode", "seo", "isActive",
            "badges", "primaryBadge"
        ];
        
        const filteredData = {};
        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                filteredData[field] = body[field];
            }
        }
        return filteredData;
    }

    async checkDependencies(cityId) {
        const placeCount = await TouristPlace.countDocuments({ cityId });
        return placeCount === 0;
    }
}

export default new CityService();
