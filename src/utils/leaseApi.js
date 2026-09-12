// Real API calls against the live Hyve backend for student tenancy leases
import config from "../config";

export async function getActiveLease() {
    const res = await config.getAPI({ url: "/api/v1/user/lease/active" });
    if (!res?.success) throw new Error(res?.message || "Failed to load active lease");
    return res.data; // LeaseResponse or null
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
