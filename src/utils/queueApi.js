// Real API calls against the live Spring Boot backend for Fair Queues
import config from "../config";
import { calculateInspectionFee } from "./feeCalculations";

export const TIER_LIMITS = {
  FREE: { name: "Free Tier", limit: 3, price: 0, decisionWindowHours: 24 },
  PREMIUM: {
    name: "Hyve Haven Plus",
    limit: 6,
    price: 4999,
    decisionWindowHours: 24,
  },
  PRO: {
    name: "Hyve Haven Pro",
    limit: 10,
    price: 9999,
    decisionWindowHours: 36,
  },
};

export async function getMyQueuesApi() {
  const res = await config.getAPI({ url: "/api/v1/queue/my-queues" });
  if (!res?.success) throw new Error(res?.message || "Failed to load queues");
  return res.data; // List<PropertyQueueResponse>
}

export async function getPropertyQueueApi(propertyId) {
  const res = await config.getAPI({
    url: `/api/v1/queue/property/${propertyId}`,
  });
  if (!res?.success)
    throw new Error(res?.message || "Failed to load property queue");
  return res.data; // PropertyQueueResponse
}

export async function getPropertyQueueSummaryApi(propertyId) {
  try {
    const res = await config.getAPI({
      url: `/api/v1/queue/property/${propertyId}/summary`,
    });
    if (res?.success && res.data) return res.data;
  } catch (err) {
    console.warn("Could not load queue summary:", err?.message);
  }
  return { totalInQueue: 0, estimatedWaitHours: 0, nextPosition: 1 };
}

export async function scheduleActiveTourApi(queueId, tourTime) {
  const res = await config.postAPI({
    url: `/api/v1/queue/${queueId}/schedule-tour`,
    params: { tourTime },
  });
  if (!res?.success)
    throw new Error(res?.message || "Failed to schedule viewing");
  return res.data; // PropertyQueueResponse
}

export async function getQueueCapacityApi() {
  const res = await config.getAPI({ url: "/api/v1/queue/capacity" });
  if (!res?.success)
    throw new Error(res?.message || "Failed to load queue capacity");
  return res.data; // QueueCapacityResponse
}

export async function joinQueueApi({ propertyId, tourDate, tourTime }) {
  const res = await config.postAPI({
    url: "/api/v1/queue/join",
    params: {
      propertyId: Number(propertyId),
      tourDate: tourDate || "",
      tourTime: tourTime || "",
    },
  });
  if (!res?.success) throw new Error(res?.message || "Failed to join queue");
  return res.data; // PropertyQueueResponse
}

export async function payInspectionFeeApi(queueId) {
  const res = await config.postAPI({
    url: `/api/v1/queue/${queueId}/pay-inspection`,
    params: {},
  });
  if (!res?.success)
    throw new Error(res?.message || "Failed to pay inspection fee");
  return res.data; // PropertyQueueResponse
}

export async function passTurnApi(queueId) {
  const res = await config.postAPI({
    url: `/api/v1/queue/${queueId}/pass`,
    params: {},
  });
  if (!res?.success) throw new Error(res?.message || "Failed to pass turn");
  return true;
}

export async function leaveQueueApi(queueId) {
  const res = await config.postAPI({
    url: `/api/v1/queue/${queueId}/leave`,
    params: {},
  });
  if (!res?.success) throw new Error(res?.message || "Failed to leave queue");
  return true;
}

export async function commitAndPayRentApi(queueId) {
  const res = await config.postAPI({
    url: `/api/v1/queue/${queueId}/commit`,
    params: {},
  });
  if (!res?.success)
    throw new Error(res?.message || "Failed to commit rent payment");
  return true;
}

export async function upgradeTierApi(tier) {
  const res = await config.postAPI({
    url: "/api/v1/queue/upgrade-tier",
    params: { tier },
  });
  if (!res?.success) throw new Error(res?.message || "Failed to upgrade tier");
  return res.data; // QueueCapacityResponse
}

export function parseServerDate(d) {
  if (!d) return null;
  if (typeof d === "number") return d;
  if (typeof d === "string") {
    // If backend returns ISO string without explicit timezone (e.g. '2026-09-26T14:00:00'),
    // appending 'Z' forces it to be treated as UTC so the user's local timezone (e.g. WAT/UTC+1)
    // doesn't cause the browser to subtract 1 hour (which made 24h start at 22h59m).
    const hasTimezone = d.endsWith("Z") || /[+-]\d{2}(:\d{2})?$/.test(d);
    const normalized = hasTimezone ? d : `${d}Z`;
    const parsed = new Date(normalized).getTime();
    return isNaN(parsed) ? new Date(d).getTime() : parsed;
  }
  return new Date(d).getTime();
}

// Maps backend PropertyQueueResponse to frontend queue shape
export function mapBackendQueue(bq) {
  if (!bq) return null;
  const windowHours = bq.ownWindowHours || 24;
  const parsedExpiresAt = parseServerDate(bq.expiresAt);
  const expiryMs = parsedExpiresAt || Date.now() + windowHours * 60 * 60 * 1000;
  const turnStartedMs = parsedExpiresAt
    ? parsedExpiresAt - windowHours * 60 * 60 * 1000
    : Date.now();

  const fallbackFee = calculateInspectionFee(bq);
  const dynamicFee =
    bq.inspectionFee != null ? Number(bq.inspectionFee) : fallbackFee.totalFee;
  const supplierShare =
    bq.supplierInspectionShare != null
      ? Number(bq.supplierInspectionShare)
      : fallbackFee.supplierBaseFee;
  const hyveShare =
    bq.hyveInspectionShare != null
      ? Number(bq.hyveInspectionShare)
      : fallbackFee.hyveShare;

  return {
    id: bq.id,
    apartmentId: bq.propertyId,
    property: bq.propertyTitle || "Apartment Listing",
    location: bq.propertyLocation || "",
    image: bq.propertyImage || "/images/apartments/apartment-image-1.png",
    price:
      bq.price != null ? Math.round(Number(bq.price)).toLocaleString() : "0",
    position: bq.position || 1,
    total: bq.totalInQueue || 1,
    peopleAhead: Math.max(0, (bq.position || 1) - 1),
    status: bq.status || "WAITING",
    inspectionPaid: Boolean(bq.inspectionPaid),
    inspectionFee: dynamicFee,
    supplierInspectionShare: supplierShare,
    hyveInspectionShare: hyveShare,
    rentPackage: bq.rentPackage || null,
    propertyType: bq.propertyType || "",
    agentName: bq.agentName || "Assigned Agent",
    agentPhone: bq.agentPhone || "+234 800 000 0000",
    agentEmail: "agent@hyvehaven.com",
    scheduledTour: bq.scheduledTour || "Scheduled Inspection",
    turnStartedAt: turnStartedMs,
    expiresAt: expiryMs,
    currentPersonExpiresAt: expiryMs,
    ownWindowHours: windowHours,
  };
}

// Maps backend QueueCapacityResponse to frontend capacity shape
export function mapBackendCapacity(bc) {
  if (!bc) return null;
  const tierName =
    bc.tier === "PRO"
      ? "Hyve Haven Pro"
      : bc.tier === "PREMIUM"
        ? "Hyve Haven Plus"
        : "Free Tier";
  return {
    canJoin: bc.canJoin,
    currentCount: bc.currentCount,
    maxLimit: bc.maxLimit,
    tier: bc.tier || "FREE",
    tierDetails: {
      name: tierName,
      limit: bc.maxLimit,
      decisionWindowHours: bc.windowHours || 24,
    },
  };
}
