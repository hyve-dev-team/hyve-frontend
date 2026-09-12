import { useState, useEffect, useCallback } from "react";
import {
  getMyQueuesApi,
  getQueueCapacityApi,
  joinQueueApi,
  payInspectionFeeApi,
  passTurnApi,
  leaveQueueApi,
  commitAndPayRentApi,
  upgradeTierApi,
  mapBackendQueue,
  mapBackendCapacity,
} from "../utils/queueApi";
import {
  getQueues as getLocalQueues,
  checkQueueCapacity as getLocalCapacity,
  getSubscriptionTier as getLocalTier,
  joinQueue as joinQueueLocal,
  leaveQueue as leaveQueueLocal,
  payInspectionFee as payInspectionFeeLocal,
  passSlot as passSlotLocal,
  commitAndPayRent as commitAndPayRentLocal,
  setSubscriptionTier as setSubscriptionTierLocal,
  getQueueForApartment as getQueueForApartmentLocal,
} from "../utils/queueStore";

export const useQueueStore = () => {
  const [queues, setQueues] = useState(getLocalQueues());
  const [capacity, setCapacity] = useState(getLocalCapacity());
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
        setQueues(getLocalQueues());
      }

      if (backendCapacity) {
        setCapacity(mapBackendCapacity(backendCapacity));
      } else {
        setCapacity(getLocalCapacity());
      }
    } catch (err) {
      console.warn("Notice: Falling back to local queue store:", err?.message);
      setQueues(getLocalQueues());
      setCapacity(getLocalCapacity());
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
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("hyve_queue_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [refresh]);

  const joinQueue = useCallback(
    async (params) => {
      try {
        const propId = params.apartmentId || params.propertyId;
        const res = await joinQueueApi({
          propertyId: propId,
          tourDate: params.tourDate,
          tourTime: params.tourTime,
        });
        await refresh();
        return { success: true, queue: mapBackendQueue(res) };
      } catch (err) {
        // Fallback to local store if offline or server rejected
        console.warn("Backend joinQueue failed, using local store fallback:", err?.message);
        const localRes = joinQueueLocal(params);
        refresh();
        return localRes;
      }
    },
    [refresh]
  );

  const leaveQueue = useCallback(
    async (queueId) => {
      try {
        await leaveQueueApi(queueId);
        await refresh();
        return { success: true };
      } catch (err) {
        console.warn("Backend leaveQueue failed, using local store fallback:", err?.message);
        const localRes = leaveQueueLocal(queueId);
        refresh();
        return localRes;
      }
    },
    [refresh]
  );

  const payInspectionFee = useCallback(
    async (queueId) => {
      try {
        const res = await payInspectionFeeApi(queueId);
        await refresh();
        return { success: true, queue: mapBackendQueue(res) };
      } catch (err) {
        console.warn("Backend payInspectionFee failed, using local store fallback:", err?.message);
        const localRes = payInspectionFeeLocal(queueId);
        refresh();
        return localRes;
      }
    },
    [refresh]
  );

  const passSlot = useCallback(
    async (queueId) => {
      try {
        await passTurnApi(queueId);
        await refresh();
        return { success: true };
      } catch (err) {
        console.warn("Backend passSlot failed, using local store fallback:", err?.message);
        const localRes = passSlotLocal(queueId);
        refresh();
        return localRes;
      }
    },
    [refresh]
  );

  const commitAndPayRent = useCallback(
    async (queueId) => {
      try {
        await commitAndPayRentApi(queueId);
        await refresh();
        return { success: true };
      } catch (err) {
        console.warn("Backend commitAndPayRent failed, using local store fallback:", err?.message);
        const localRes = commitAndPayRentLocal(queueId);
        refresh();
        return localRes;
      }
    },
    [refresh]
  );

  const upgradeTier = useCallback(
    async (tier) => {
      try {
        const res = await upgradeTierApi(tier);
        await refresh();
        return { success: true, capacity: mapBackendCapacity(res) };
      } catch (err) {
        console.warn("Backend upgradeTier failed, using local store fallback:", err?.message);
        const localRes = setSubscriptionTierLocal(tier);
        refresh();
        return localRes;
      }
    },
    [refresh]
  );

  const getQueueForApartment = useCallback(
    (apartmentId) => {
      // Look up in active state first
      const found = queues.find(
        (q) => Number(q.apartmentId) === Number(apartmentId)
      );
      if (found) return found;
      return getQueueForApartmentLocal(apartmentId);
    },
    [queues]
  );

  return {
    queues,
    capacity,
    tier: capacity?.tier || getLocalTier(),
    isLoading,
    joinQueue,
    leaveQueue,
    payInspectionFee,
    passSlot,
    commitAndPayRent,
    upgradeTier,
    getQueueForApartment,
    refresh,
  };
};

export default useQueueStore;
