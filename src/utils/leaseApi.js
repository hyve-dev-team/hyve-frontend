// Real API calls against the live Hyve backend for student tenancy leases
import config from "../config";

export async function getActiveLease() {
    try {
        const res = await config.getAPI({ url: "/api/v1/user/lease/active" });
        if (!res?.success) return null;
        return res.data; // LeaseResponse or null
    } catch {
        // Any 403, 404, or network issue means no active lease found for this user
        return null;
    }
}

export async function createLease({ propertyId, durationMonths = 12, moveInDate }) {
    const res = await config.postAPI({
        url: "/api/v1/user/lease/book",
        params: {
            propertyId: Number(propertyId),
            durationMonths: Number(durationMonths),
            ...(moveInDate ? { moveInDate } : {}),
        },
    });
    if (!res?.success) throw new Error(res?.message || "Failed to confirm lease");
    return res.data; // LeaseResponse
}

export async function getLeaseHistory() {
    const res = await config.getAPI({ url: "/api/v1/user/lease/history" });
    if (!res?.success) throw new Error(res?.message || "Failed to load lease history");
    return res.data; // LeaseResponse[]
}

export async function scheduleMoveInApi({ propertyId, leaseId, moveInDate, moveInTime }) {
    const res = await config.postAPI({
        url: "/api/v1/user/lease/schedule-move-in",
        params: {
            propertyId: propertyId ? Number(propertyId) : undefined,
            leaseId: leaseId ? Number(leaseId) : undefined,
            moveInDate,
            moveInTime,
        },
    });
    if (!res?.success) throw new Error(res?.message || "Failed to schedule move-in");
    return res.data; // LeaseResponse
}

export async function confirmMoveInApi(leaseId) {
    const res = await config.postAPI({
        url: `/api/v1/user/lease/confirm-move-in/${leaseId}`,
    });
    if (!res?.success) throw new Error(res?.message || "Failed to confirm move-in");
    return res.data; // LeaseResponse
}
