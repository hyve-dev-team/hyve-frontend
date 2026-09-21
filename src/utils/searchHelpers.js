/**
 * Normalizes text so that word numbers, hyphenated terms, and synonyms match.
 * e.g., "two bedroom" -> "2 bedroom", "self-con" -> "self-contain", "beds" -> "bedroom"
 */
export function normalizeSearchText(text) {
    if (!text) return "";
    return text
        .toLowerCase()
        .replace(/\btwo\b/g, "2")
        .replace(/\bthree\b/g, "3")
        .replace(/\bfour\b/g, "4")
        .replace(/\bone\b/g, "1")
        .replace(/\bself-con\b/g, "self-contain")
        .replace(/\bself con\b/g, "self-contain")
        .replace(/\bselfcon\b/g, "self-contain")
        .replace(/\bbeds\b/g, "bedroom")
        .replace(/\bbed\b/g, "bedroom")
        .replace(/[-_]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

/**
 * Detects the number of bedrooms from property title, description, and type.
 */
export function detectBedrooms(lodge) {
    if (!lodge) return null;
    const text = normalizeSearchText(
        `${lodge.lodgeDesc || ""} ${lodge.description || ""} ${lodge.propertyType || ""}`
    );

    if (
        lodge.propertyType === "STUDIO" ||
        text.includes("studio") ||
        text.includes("self contain")
    ) {
        return 1;
    }
    if (text.includes("3 bedroom") || text.includes("4 bedroom")) {
        return 3;
    }
    if (text.includes("2 bedroom")) {
        return 2;
    }
    if (text.includes("1 bedroom") || text.includes("single room") || text.includes("1 room")) {
        return 1;
    }
    return null;
}

export const PROPERTY_TYPES = [
    { value: "", label: "All Types" },
    { value: "STUDIO", label: "Studio / Self-Contain" },
    { value: "APARTMENT", label: "Flat / Apartment" },
    { value: "ROOM", label: "Single Room" },
    { value: "HOUSE", label: "Entire House" },
];

export const BEDROOM_OPTIONS = [
    { value: "", label: "Any Bedrooms" },
    { value: "1", label: "1 Bedroom" },
    { value: "2", label: "2 Bedrooms" },
    { value: "3", label: "3+ Bedrooms" },
];

export const COMMUNITY_OPTIONS = [
    { value: "", label: "All Communities" },
    { value: "Akoka", label: "Akoka" },
    { value: "Yaba", label: "Yaba" },
    { value: "Surulere", label: "Surulere" },
    { value: "Bariga", label: "Bariga" },
    { value: "Gbagada", label: "Gbagada" },
    { value: "Ikeja", label: "Ikeja" },
    { value: "Lekki", label: "Lekki" },
    { value: "Victoria Island", label: "Victoria Island" },
];

export const BUDGET_OPTIONS = [
    { value: "", label: "Any Budget" },
    { value: "250000", label: "Up to ₦250k" },
    { value: "400000", label: "Up to ₦400k" },
    { value: "600000", label: "Up to ₦600k" },
    { value: "1000000", label: "Up to ₦1M" },
    { value: "1500000", label: "Up to ₦1.5M" },
];

export const SORT_OPTIONS = {
    "": "Default Sorting",
    nearby: "Nearest to me (GPS)",
    lowest: "Lowest price",
    highest: "Highest price",
    newest: "Newest listings",
    oldest: "Oldest listings",
};
