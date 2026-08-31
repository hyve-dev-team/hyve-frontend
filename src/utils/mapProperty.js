// Maps the real backend Property shape to the display shape the existing tenant
// UI components (AllApartments, ApartmentDetails, etc.) were already built around
// (lodgeDesc/price/nearbyDistance/lodgeImage/amenities/status), so those components
// don't need a full rewrite — just a real data source instead of utils/featuredLodges.js.
import placeholderImage from "../assets/images/apartments/apartment-image-1.png";

export function mapProperty(p) {
    if (!p) return null;

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
    };
}

export function mapProperties(list) {
    return (list || []).map(mapProperty);
}
