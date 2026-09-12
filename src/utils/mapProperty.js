// Maps the real backend Property shape to the display shape the existing tenant
// UI components (AllApartments, ApartmentDetails, etc.) were already built around
// (lodgeDesc/price/nearbyDistance/lodgeImage/amenities/status), so those components
// don't need a full rewrite — just a real data source instead of utils/featuredLodges.js.
import placeholderImage from "../assets/images/apartments/apartment-image-1.png";

export function mapProperty(item) {
    if (!item) return null;

    // Handle both direct Property entity and NearbyPropertyResponse wrapper ({ property, distanceKm })
    const p = item.property ? item.property : item;
    const distanceKm = item.distanceKm != null ? item.distanceKm : (p.distanceKm != null ? p.distanceKm : null);

    const reviews = p.reviews || [];
    const avgRating = reviews.length
        ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
        : "New";

    // ApartmentReviews.jsx expects { author, review, rating, profileImage } per
    // review — map from the real backend's { student: {firstName,lastName}, comment }.
    const mappedReviews = reviews.map((r) => ({
        id: r.id,
        author: `${r.student?.firstName || ""} ${r.student?.lastName || ""}`.trim() || "Anonymous",
        review: r.comment || "",
        rating: r.rating || 0,
        profileImage: null,
        createdAt: r.createdAt,
    }));

    return {
        id: p.id,
        lodgeDesc: p.title || "Untitled listing",
        description: p.description || "",
        price: p.priceMonthly != null ? Math.round(p.priceMonthly) : 0,
        nearbyDistance: p.location || "",
        latitude: p.latitude || null,
        longitude: p.longitude || null,
        distanceKm: distanceKm != null ? Number(distanceKm) : null,
        lodgeImage: (p.images && p.images[0]) || placeholderImage,
        images: p.images && p.images.length ? p.images : [placeholderImage],
        amenities: (p.amenities || []).join(", ") || "No amenities listed",
        amenitiesList: p.amenities || [],
        status: p.status === "ACTIVE" ? "open" : "closed",
        propertyType: p.propertyType || "",
        starRating: avgRating,
        totalReviews: reviews.length,
        reviews: mappedReviews,
        landlord: p.landlord || null,
        createdAt: p.createdAt || null,
    };
}

export function mapProperties(list) {
    return (list || []).map(mapProperty);
}

/**
 * Calculates distance in kilometers between two GPS coordinates using Haversine formula
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
    if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
    const R = 6371; // Earth radius in km
    const dLat = ((Number(lat2) - Number(lat1)) * Math.PI) / 180;
    const dLon = ((Number(lon2) - Number(lon1)) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((Number(lat1) * Math.PI) / 180) *
        Math.cos((Number(lat2) * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
}
