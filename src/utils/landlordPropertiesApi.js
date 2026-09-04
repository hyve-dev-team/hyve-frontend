import config from "../config";

/**
 * Fetch all properties owned by the authenticated landlord
 * API Endpoint: GET /api/v1/landlord/properties
 */
export async function getLandlordProperties() {
    const res = await config.getAPI({
        url: "/api/v1/landlord/properties",
    });
    if (!res?.success) {
        throw new Error(res?.message || "Failed to load landlord properties");
    }
    return res.data || [];
}

/**
 * Fetch a single property by ID belonging to the authenticated landlord
 * API Endpoint: GET /api/v1/landlord/properties/{id}
 */
export async function getLandlordPropertyById(id) {
    const res = await config.getAPI({
        url: `/api/v1/landlord/properties/${id}`,
    });
    if (!res?.success) {
        throw new Error(res?.message || "Property not found");
    }
    return res.data;
}

/**
 * Create a new property listing for the authenticated landlord
 * API Endpoint: POST /api/v1/landlord/properties
 */
export async function createLandlordProperty(propertyData) {
    const res = await config.postAPI({
        url: "/api/v1/landlord/properties",
        params: propertyData,
    });
    if (!res?.success) {
        throw new Error(res?.message || "Failed to create property");
    }
    return res.data;
}

/**
 * Update an existing property listing
 * API Endpoint: PUT /api/v1/landlord/properties/{id}
 */
export async function updateLandlordProperty(id, propertyData) {
    const res = await config.allAPI({
        url: `/api/v1/landlord/properties/${id}`,
        method: "PUT",
        params: propertyData,
    });
    if (!res?.success) {
        throw new Error(res?.message || "Failed to update property");
    }
    return res.data;
}

/**
 * Delete a property listing
 * API Endpoint: DELETE /api/v1/landlord/properties/{id}
 */
export async function deleteLandlordProperty(id) {
    const res = await config.allAPI({
        url: `/api/v1/landlord/properties/${id}`,
        method: "DELETE",
        params: {},
    });
    if (!res?.success) {
        throw new Error(res?.message || "Failed to delete property");
    }
    return true;
}
