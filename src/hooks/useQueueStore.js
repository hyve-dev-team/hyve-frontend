import { useState, useEffect, useCallback } from "react";
import {
  getMyQueuesApi,
  getQueueCapacityApi,
  getPropertyQueueApi,
  joinQueueApi,
  payInspectionFeeApi,
  passTurnApi,
  leaveQueueApi,
  commitAndPayRentApi,
  upgradeTierApi,
  mapBackendQueue,
  mapBackendCapacity,
  TIER_LIMITS,
} from "../utils/queueApi";

// Purge any old mockup queue data stored previously in local storage
try {
  localStorage.removeItem("hyve_tenant_queues");
  localStorage.removeItem("hyve_subscription_tier");
} catch {
  // Ignore storage errors
}

const DEFAULT_CAPACITY = {
  canJoin: true,
  currentCount: 0,
  maxLimit: 3,
  tier: "FREE",
  tierDetails: TIER_LIMITS.FREE,
};

export const useQueueStore = () => {
  const [queues, setQueues] = useState([]);
  const [capacity, setCapacity] = useState(DEFAULT_CAPACITY);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const [backendQueues, backendCapacity] = await Promise.all([
        getMyQueuesApi().catch(() => null),
        getQueueCapacityApi().catch(() => null),
      ]);

      if (backendQueues && Array.isArray(backendQueues)) {
        setQueues(backendQueues.map(mapBackendQueue));
      } else {
        setQueues([]);
      }

      if (backendCapacity) {
        setCapacity(mapBackendCapacity(backendCapacity));
      } else {
        setCapacity(DEFAULT_CAPACITY);
      }
    } catch (err) {
      console.warn("Could not load queues from API:", err?.message);
      setQueues([]);
      setCapacity(DEFAULT_CAPACITY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    const handleUpdate = () => {
      refresh();
    };

    window.addEventListener("hyve_queue_updated", handleUpdate);

    return () => {
      window.removeEventListener("hyve_queue_updated", handleUpdate);
    };
  }, [refresh]);

  const joinQueue = useCallback(
    async (params) => {
      const propId = params.apartmentId || params.propertyId;
      const res = await joinQueueApi({
        propertyId: propId,
        tourDate: params.tourDate,
        tourTime: params.tourTime,
      });
      await refresh();
      window.dispatchEvent(new Event("hyve_queue_updated"));
      return { success: true, queue: mapBackendQueue(res) };
    },
    [refresh]
  );

  const leaveQueue = useCallback(
    async (queueId) => {
      await leaveQueueApi(queueId);
      setQueues((prev) => prev.filter((q) => q.id !== queueId));
      await refresh();
      window.dispatchEvent(new Event("hyve_queue_updated"));
      return { success: true };
    },
    [refresh]
  );

  const payInspectionFee = useCallback(
    async (queueId) => {
      const res = await payInspectionFeeApi(queueId);
      await refresh();
      window.dispatchEvent(new Event("hyve_queue_updated"));
      return { success: true, queue: mapBackendQueue(res) };
    },
    [refresh]
  );

  const passSlot = useCallback(
    async (queueId) => {
      await passTurnApi(queueId);
      setQueues((prev) => prev.filter((q) => q.id !== queueId));
      await refresh();
      window.dispatchEvent(new Event("hyve_queue_updated"));
      return { success: true };
    },
    [refresh]
  );

  const commitAndPayRent = useCallback(
    async (queueId) => {
      await commitAndPayRentApi(queueId);
      await refresh();
      window.dispatchEvent(new Event("hyve_queue_updated"));
      return { success: true };
    },
    [refresh]
  );

  const upgradeTier = useCallback(
    async (tier) => {
      const res = await upgradeTierApi(tier);
      await refresh();
      window.dispatchEvent(new Event("hyve_queue_updated"));
      return { success: true, capacity: mapBackendCapacity(res) };
    },
    [refresh]
  );

  const getQueueForApartment = useCallback(
    (apartmentId) => {
      if (!apartmentId) return null;
      const idNum = Number(apartmentId);
      return queues.find((q) => Number(q.apartmentId) === idNum && q.status !== "CLOSED" && q.status !== "PASSED") || null;
    },
    [queues]
  );

  return {
    queues,
    capacity,
    tier: capacity?.tier || "FREE",
    isLoading,
    joinQueue,
    leaveQueue,
    payInspectionFee,
    passSlot,
    commitAndPayRent,
    upgradeTier,
    getQueueForApartment,
    fetchPropertyQueue: getPropertyQueueApi,
    refresh,
  };
};

export default useQueueStore;
