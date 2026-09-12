import config from "../config";

/**
 * Format phone number to international WhatsApp format (defaults to Nigeria +234)
 */
export function formatWhatsAppPhone(phone) {
    if (!phone) return "";
    let cleaned = phone.replace(/[^0-9]/g, "");
    if (cleaned.startsWith("0")) {
        cleaned = "234" + cleaned.substring(1);
    }
    return cleaned;
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
