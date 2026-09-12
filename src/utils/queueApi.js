// Real API calls against the live Spring Boot backend for Fair Queues
import config from "../config";

export const TIER_LIMITS = {
  FREE: { name: "Free Tier", limit: 3, price: 0, decisionWindowHours: 24 },
  PREMIUM: { name: "HYVE Plus", limit: 6, price: 4999, decisionWindowHours: 24 },
  PRO: { name: "HYVE Pro", limit: 10, price: 9999, decisionWindowHours: 36 },
};

export async function getMyQueuesApi() {
  const res = await config.getAPI({ url: "/api/v1/queue/my-queues" });
  if (!res?.success) throw new Error(res?.message || "Failed to load queues");
  return res.data; // List<PropertyQueueResponse>
}

export async function getPropertyQueueApi(propertyId) {
  const res = await config.getAPI({ url: `/api/v1/queue/property/${propertyId}` });
  if (!res?.success) throw new Error(res?.message || "Failed to load property queue");
  return res.data; // PropertyQueueResponse
}

export async function getQueueCapacityApi() {
  const res = await config.getAPI({ url: "/api/v1/queue/capacity" });
  if (!res?.success) throw new Error(res?.message || "Failed to load queue capacity");
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
  if (!res?.success) throw new Error(res?.message || "Failed to pay inspection fee");
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
  if (!res?.success) throw new Error(res?.message || "Failed to commit rent payment");
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

// Maps backend PropertyQueueResponse to frontend queue shape
export function mapBackendQueue(bq) {
  if (!bq) return null;
  return {
    id: bq.id,
    apartmentId: bq.propertyId,
    property: bq.propertyTitle || "Apartment Listing",
    location: bq.propertyLocation || "",
    image: bq.propertyImage || "/images/apartments/apartment-image-1.png",
    price: bq.price != null ? Math.round(Number(bq.price)).toLocaleString() : "0",
    position: bq.position || 1,
    total: bq.totalInQueue || 1,
    peopleAhead: Math.max(0, (bq.position || 1) - 1),
    status: bq.status || "WAITING",
    inspectionPaid: Boolean(bq.inspectionPaid),
    inspectionFee: 5000,
    agentName: bq.agentName || "Assigned Agent",
    agentPhone: bq.agentPhone || "+234 800 000 0000",
    agentEmail: "agent@hyvehaven.com",
    scheduledTour: bq.scheduledTour || "Scheduled Inspection",
    turnStartedAt: bq.expiresAt ? new Date(new Date(bq.expiresAt).getTime() - 24 * 60 * 60 * 1000).getTime() : Date.now(),
    expiresAt: bq.expiresAt ? new Date(bq.expiresAt).getTime() : Date.now() + 24 * 60 * 60 * 1000,
    currentPersonExpiresAt: bq.expiresAt ? new Date(bq.expiresAt).getTime() : Date.now() + 12 * 60 * 60 * 1000,
    ownWindowHours: bq.ownWindowHours || 24,
  };
}

// Maps backend QueueCapacityResponse to frontend capacity shape
export function mapBackendCapacity(bc) {
  if (!bc) return null;
  const tierName = bc.tier === "PRO" ? "HYVE Pro" : bc.tier === "PREMIUM" ? "HYVE Plus" : "Free Tier";
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
