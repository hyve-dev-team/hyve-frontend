import { useState, useEffect, useCallback } from "react";
import {
  getQueues,
  checkQueueCapacity,
  getSubscriptionTier,
  joinQueue as joinQueueStore,
  leaveQueue as leaveQueueStore,
  payInspectionFee as payInspectionFeeStore,
  passSlot as passSlotStore,
  commitAndPayRent as commitAndPayRentStore,
  setSubscriptionTier as setSubscriptionTierStore,
  getQueueForApartment as getQueueForApartmentStore,
} from "../utils/queueStore";

export const useQueueStore = () => {
  const [queues, setQueues] = useState(getQueues());
  const [capacity, setCapacity] = useState(checkQueueCapacity());

  const refresh = useCallback(() => {
    setQueues(getQueues());
    setCapacity(checkQueueCapacity());
  }, []);

  useEffect(() => {
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

  const joinQueue = useCallback((params) => {
    const result = joinQueueStore(params);
    refresh();
    return result;
  }, [refresh]);

  const leaveQueue = useCallback((queueId) => {
    const result = leaveQueueStore(queueId);
    refresh();
    return result;
  }, [refresh]);

  const payInspectionFee = useCallback((queueId) => {
    const result = payInspectionFeeStore(queueId);
    refresh();
    return result;
  }, [refresh]);

  const passSlot = useCallback((queueId) => {
    const result = passSlotStore(queueId);
    refresh();
    return result;
  }, [refresh]);

  const commitAndPayRent = useCallback((queueId) => {
    const result = commitAndPayRentStore(queueId);
    refresh();
    return result;
  }, [refresh]);

  const upgradeTier = useCallback((tier) => {
    const result = setSubscriptionTierStore(tier);
    refresh();
    return result;
  }, [refresh]);

  const getQueueForApartment = useCallback((apartmentId) => {
    return getQueueForApartmentStore(apartmentId);
  }, []);

  return {
    queues,
    capacity,
    tier: getSubscriptionTier(),
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
