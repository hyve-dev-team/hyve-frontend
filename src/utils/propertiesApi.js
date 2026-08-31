// Real API calls against the live Hyve backend (see Swagger:
// hyvn-api-production-66db.up.railway.app/swagger-ui). Centralized here so every
// tenant page (Dashboard, Search, Saved, ApartmentDetails) calls the same functions
// instead of duplicating fetch/endpoint logic.
import config from "../config";

export async function getProperties({ page = 0, size = 50, sortBy } = {}) {
    const res = await config.getAPI({
        url: "/api/v1/user/properties",
        params: { page, size, ...(sortBy ? { sortBy } : {}) },
    });
    if (!res?.success) throw new Error(res?.message || "Failed to load properties");
    return res.data; // PageProperty: { content, totalElements, ... }
}

export async function getPropertyById(id) {
    const res = await config.getAPI({ url: `/api/v1/user/properties/${id}` });
    if (!res?.success) throw new Error(res?.message || "Property not found");
    return res.data; // Property
}

export async function getSavedProperties() {
    const res = await config.getAPI({ url: "/api/v1/user/properties/saved" });
    if (!res?.success) throw new Error(res?.message || "Failed to load saved properties");
    return res.data; // Property[]
}

export async function saveProperty(id) {
    const res = await config.postAPI({ url: `/api/v1/user/properties/${id}/save`, params: {} });
    if (!res?.success) throw new Error(res?.message || "Failed to save property");
    return true;
}

export async function unsaveProperty(id) {
    const res = await config.allAPI({ url: `/api/v1/user/properties/${id}/save`, method: "DELETE", params: {} });
    if (!res?.success) throw new Error(res?.message || "Failed to unsave property");
    return true;
}

export async function addReview(id, { rating, comment }) {
    const res = await config.postAPI({
        url: `/api/v1/user/properties/${id}/reviews`,
        params: { rating, comment },
    });
    if (!res?.success) throw new Error(res?.message || "Failed to submit review");
    return res.data; // Review
}
