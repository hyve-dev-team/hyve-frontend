import config from "../config";

/**
 * Format phone number to international WhatsApp format digits (e.g. 2348056237380)
 * Works for 080..., 80..., +234..., 2340...
 */
export function formatWhatsAppPhone(phone) {
    if (!phone) return "";
    let cleaned = String(phone).replace(/\D/g, "");
    if (!cleaned) return "";

    // Handle erroneous +2340... (e.g. 234080...)
    if (cleaned.startsWith("2340") && cleaned.length >= 14) {
        cleaned = "234" + cleaned.substring(4);
    }
    // Standard Nigerian 11-digit local format: 080..., 070..., 090..., 081...
    else if (cleaned.startsWith("0")) {
        cleaned = "234" + cleaned.substring(1);
    }
    // 10-digit format without leading 0: 805..., 703..., 901...
    else if (cleaned.length === 10 && /^[789]/.test(cleaned)) {
        cleaned = "234" + cleaned;
    }

    return cleaned;
}

/**
 * Format phone number for display/storage with standard "+234 800 000 0000" formatting
 */
export function formatDisplayPhone(phone) {
    const wa = formatWhatsAppPhone(phone);
    if (!wa) return phone || "";
    if (wa.startsWith("234") && wa.length === 13) {
        return `+234 ${wa.substring(3, 6)} ${wa.substring(6, 9)} ${wa.substring(9)}`;
    }
    return String(phone).startsWith("+") ? String(phone) : `+${wa}`;
}

/**
 * Build a direct wa.me link with pre-filled message text
 */
export function buildWhatsAppLink(phone, messageText) {
    const cleanPhone = formatWhatsAppPhone(phone);
    if (!cleanPhone) return "";
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText || "")}`;
}

// -------------------------------------------------------------
// Landlord Agent Management Endpoints
// -------------------------------------------------------------

export async function getPropertyAgents(propertyId) {
    const res = await config.getAPI({
        url: `/api/v1/landlord/properties/${propertyId}/agents`,
    });
    if (!res?.success) throw new Error(res?.message || "Failed to load agents");
    return res.data; // AgentDto[]
}

export async function addPropertyAgent(propertyId, { fullName, whatsappNumber, roleTitle = "Agent/Caretaker", isPrimary = false }) {
    const res = await config.postAPI({
        url: `/api/v1/landlord/properties/${propertyId}/agents`,
        params: { fullName, whatsappNumber, roleTitle, isPrimary },
    });
    if (!res?.success) throw new Error(res?.message || "Failed to save agent");
    return res.data; // AgentDto
}

export async function deletePropertyAgent(propertyId, agentId) {
    const res = await config.allAPI({
        url: `/api/v1/landlord/properties/${propertyId}/agents/${agentId}`,
        method: "DELETE",
        params: {},
    });
    if (!res?.success) throw new Error(res?.message || "Failed to delete agent");
    return true;
}

// -------------------------------------------------------------
// Tenant Tour Booking Endpoints
// -------------------------------------------------------------

export async function bookTourInspection({ propertyId, tourDate, tourTime, tenantFullName, tenantPhoneNumber }) {
    const res = await config.postAPI({
        url: "/api/v1/user/inspections/book",
        params: {
            propertyId: Number(propertyId),
            tourDate,
            tourTime,
            tenantFullName,
            tenantPhoneNumber,
        },
    });
    if (!res?.success) throw new Error(res?.message || "Failed to schedule tour");
    return res.data; // TourInspectionResponse
}

export async function getPropertyInspection(propertyId) {
    try {
        const res = await config.getAPI({
            url: `/api/v1/user/inspections/property/${propertyId}`,
        });
        if (!res?.success) return null;
        return res.data; // TourInspectionResponse or null
    } catch {
        return null;
    }
}

export async function acceptProposedInspectionTime(inspectionId) {
    const res = await config.postAPI({
        url: `/api/v1/user/inspections/${inspectionId}/accept-proposal`,
        params: {},
    });
    if (!res?.success) throw new Error(res?.message || "Failed to accept proposed time");
    return res.data; // TourInspectionResponse
}

export async function payTourInspectionFee(inspectionId) {
    const res = await config.postAPI({
        url: `/api/v1/user/inspections/${inspectionId}/pay-fee`,
        params: {},
    });
    if (!res?.success) throw new Error(res?.message || "Failed to process inspection fee payment");
    return res.data; // TourInspectionResponse
}

// -------------------------------------------------------------
// Public Viewing Link Endpoints
// -------------------------------------------------------------

export async function getPublicInspection(token) {
    const res = await config.getAPI({
        url: `/api/v1/public/inspections/${token}`,
    });
    if (!res?.success) throw new Error(res?.message || "Viewing link invalid or expired");
    return res.data; // TourInspectionResponse
}

export async function respondToPublicInspection(token, { action, proposedDate, proposedTime, notes }) {
    const res = await config.postAPI({
        url: `/api/v1/public/inspections/${token}/respond`,
        params: {
            action, // "ACCEPT" | "PROPOSE_TIME" | "DECLINE"
            ...(proposedDate ? { proposedDate } : {}),
            ...(proposedTime ? { proposedTime } : {}),
            ...(notes ? { notes } : {}),
        },
    });
    if (!res?.success) throw new Error(res?.message || "Failed to submit response");
    return res.data; // TourInspectionResponse
}

// -------------------------------------------------------------
// Landlord Dashboard Inspection Endpoints
// -------------------------------------------------------------

export async function getLandlordInspections() {
    try {
        const res = await config.getAPI({
            url: `/api/v1/landlord/inspections`,
        });
        if (!res?.success) return [];
        return res.data || [];
    } catch {
        return [];
    }
}

export async function respondToLandlordInspection(inspectionId, { action, proposedDate, proposedTime, notes }) {
    const res = await config.postAPI({
        url: `/api/v1/landlord/inspections/${inspectionId}/respond`,
        params: {
            action,
            ...(proposedDate ? { proposedDate } : {}),
            ...(proposedTime ? { proposedTime } : {}),
            ...(notes ? { notes } : {}),
        },
    });
    if (!res?.success) throw new Error(res?.message || "Failed to submit response");
    return res.data;
}
