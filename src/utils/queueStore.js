// HYVE Fair Queue Store & Service
// Business rules:
// - Free limit: 3 active queues
// - Premium tier: 6 active queues
// - Pro tier: 10 active queues
// - 24-hour exclusive window once it's your turn
// - Inspection fee unlocks agent contact & tour schedule
// - Real-time countdowns & event synchronization across components

const QUEUE_STORAGE_KEY = "hyve_tenant_queues";
const TIER_STORAGE_KEY = "hyve_subscription_tier";

export const TIER_LIMITS = {
  FREE: { name: "Free Tier", limit: 3, price: 0, decisionWindowHours: 24 },
  PREMIUM: { name: "HYVE Plus", limit: 6, price: 4999, decisionWindowHours: 24 },
  PRO: { name: "HYVE Pro", limit: 10, price: 9999, decisionWindowHours: 36 },
};

// Initial realistic seed queues
const INITIAL_QUEUES = [
  {
    id: "queue-1",
    apartmentId: 2,
    property: "Modern Self-Contain Apartment",
    location: "Yaba, Lagos (Near Unilag)",
    image: "/images/apartments/apartment-image-2.png",
    price: "650,000",
    position: 1,
    total: 5,
    peopleAhead: 0,
    status: "ACTIVE", // ACTIVE = Position 1
    inspectionFee: 5000,
    inspectionPaid: true,
    agentName: "Babatunde Adeleke",
    agentPhone: "+234 803 456 7890",
    agentEmail: "babatunde.adeleke@hyve.ng",
    scheduledTour: "Tomorrow at 11:00 AM",
    turnStartedAt: Date.now() - 5.5 * 60 * 60 * 1000, // 5.5 hours ago
    expiresAt: Date.now() + 18.5 * 60 * 60 * 1000, // ~18h 30m remaining
  },
  {
    id: "queue-2",
    apartmentId: 1,
    property: "Luxury Studio Apartment",
    location: "Akoka, Yaba, Lagos",
    image: "/images/apartments/apartment-image-1.png",
    price: "450,000",
    position: 2,
    total: 7,
    peopleAhead: 1,
    status: "WAITING", // WAITING = Waiting for person #1
    inspectionFee: 5000,
    inspectionPaid: false,
    agentName: "Chioma Nwosu",
    agentPhone: "+234 812 345 6789",
    agentEmail: "chioma.nwosu@hyve.ng",
    scheduledTour: "Preferred: Fri, 2:00 PM",
    currentPersonExpiresAt: Date.now() + 11.75 * 60 * 60 * 1000, // Person #1 has ~11h 45m left
    ownWindowHours: 24,
  },
];

export const getSubscriptionTier = () => {
  try {
    const saved = localStorage.getItem(TIER_STORAGE_KEY);
    if (saved && TIER_LIMITS[saved]) {
      return saved;
    }
  } catch (e) {
    console.error("Error reading subscription tier:", e);
  }
  return "FREE";
};

export const setSubscriptionTier = (tier) => {
  if (TIER_LIMITS[tier]) {
    localStorage.setItem(TIER_STORAGE_KEY, tier);
    dispatchQueueEvent();
    return true;
  }
  return false;
};

export const getQueues = () => {
  try {
    const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // Seed initial queues
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(INITIAL_QUEUES));
    return INITIAL_QUEUES;
  } catch (e) {
    console.error("Error reading queues from storage:", e);
    return INITIAL_QUEUES;
  }
};

const saveQueues = (queues) => {
  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queues));
    dispatchQueueEvent();
  } catch (e) {
    console.error("Error saving queues:", e);
  }
};

const dispatchQueueEvent = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("hyve_queue_updated"));
  }
};

export const checkQueueCapacity = () => {
  const queues = getQueues();
  const currentCount = queues.filter((q) => q.status !== "CLOSED" && q.status !== "PASSED").length;
  const tier = getSubscriptionTier();
  const maxLimit = TIER_LIMITS[tier].limit;
  const canJoin = currentCount < maxLimit;

  return {
    canJoin,
    currentCount,
    maxLimit,
    tier,
    tierDetails: TIER_LIMITS[tier],
  };
};

export const getQueueForApartment = (apartmentId) => {
  const queues = getQueues();
  const idNum = Number(apartmentId);
  return queues.find((q) => Number(q.apartmentId) === idNum && q.status !== "CLOSED" && q.status !== "PASSED") || null;
};

export const joinQueue = ({
  apartmentId,
  propertyTitle,
  price,
  image,
  location,
  tourDate,
  tourTime,
  agentName,
  agentPhone,
}) => {
  const capacity = checkQueueCapacity();
  if (!capacity.canJoin) {
    return {
      success: false,
      limitReached: true,
      currentCount: capacity.currentCount,
      maxLimit: capacity.maxLimit,
      tier: capacity.tier,
    };
  }

  const queues = getQueues();
  const idNum = Number(apartmentId);
  const existing = queues.find((q) => Number(q.apartmentId) === idNum && q.status !== "CLOSED" && q.status !== "PASSED");
  if (existing) {
    return {
      success: false,
      alreadyInQueue: true,
      queue: existing,
    };
  }

  // Determine assigned position
  // Simulating existing queue size for the apartment (between 1 and 4)
  const isFirst = queues.length === 0;
  const assignedPosition = isFirst ? 1 : 2 + (queues.length % 3);
  const totalInQueue = assignedPosition + 3;

  const now = Date.now();
  const isTurnNow = assignedPosition === 1;

  const newQueueItem = {
    id: `queue-${Date.now()}`,
    apartmentId: idNum,
    property: propertyTitle || "Verified Apartment",
    location: location || "Lagos, Nigeria",
    image: image || "/images/apartments/apartment-image-1.png",
    price: typeof price === "number" ? price.toLocaleString() : price || "500,000",
    position: assignedPosition,
    total: totalInQueue,
    peopleAhead: assignedPosition - 1,
    status: isTurnNow ? "ACTIVE" : "WAITING",
    inspectionFee: 5000,
    inspectionPaid: false, // Must be paid when it's your turn
    agentName: agentName || "HYVE Verified Agent",
    agentPhone: agentPhone || "+234 800 498 3200",
    agentEmail: "support@hyve.ng",
    scheduledTour: tourDate && tourTime ? `${tourDate} at ${tourTime}` : "Pending confirmation",
    turnStartedAt: isTurnNow ? now : null,
    expiresAt: isTurnNow ? now + 24 * 60 * 60 * 1000 : null,
    currentPersonExpiresAt: isTurnNow ? null : now + 14 * 60 * 60 * 1000,
    ownWindowHours: 24,
    createdAt: now,
  };

  const updatedQueues = [newQueueItem, ...queues];
  saveQueues(updatedQueues);

  return {
    success: true,
    queue: newQueueItem,
  };
};

export const leaveQueue = (queueId) => {
  const queues = getQueues();
  const queueToLeave = queues.find((q) => q.id === queueId);
  const updated = queues.filter((q) => q.id !== queueId);
  saveQueues(updated);
  return { success: true, removed: queueToLeave };
};

export const payInspectionFee = (queueId) => {
  const queues = getQueues();
  const now = Date.now();
  const updated = queues.map((q) => {
    if (q.id === queueId) {
      return {
        ...q,
        inspectionPaid: true,
        status: "ACTIVE",
        turnStartedAt: now,
        expiresAt: now + 24 * 60 * 60 * 1000, // Full fresh 24 hours
      };
    }
    return q;
  });
  saveQueues(updated);
  return { success: true };
};

export const passSlot = (queueId) => {
  const queues = getQueues();
  const target = queues.find((q) => q.id === queueId);

  // Mark this queue as PASSED / remove from active queues
  const updated = queues.filter((q) => q.id !== queueId);
  saveQueues(updated);

  return {
    success: true,
    passedQueue: target,
    message: "You have passed your turn. The slot has been given to the next person in line.",
  };
};

export const commitAndPayRent = (queueId) => {
  const queues = getQueues();
  const target = queues.find((q) => q.id === queueId);
  if (!target) return { success: false };

  // Closing the queue because the apartment is successfully taken
  const updated = queues.filter((q) => q.id !== queueId);
  saveQueues(updated);

  return {
    success: true,
    apartmentId: target.apartmentId,
    message: "Payment initiated into escrow! The listing queue is closed for other participants.",
  };
};
