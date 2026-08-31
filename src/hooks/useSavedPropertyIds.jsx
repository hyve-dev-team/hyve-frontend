import { useState, useEffect, useCallback } from 'react';
import { getSavedProperties } from '../utils/propertiesApi';

// Fetches the tenant's real saved-property ids once, and exposes a local Set plus
// an optimistic updater so AllApartments can flip a heart icon instantly on
// save/unsave without waiting for a full refetch.
export default function useSavedPropertyIds() {
    const [savedIds, setSavedIds] = useState(new Set());
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        try {
            const properties = await getSavedProperties();
            setSavedIds(new Set(properties.map((p) => p.id)));
        } catch (err) {
            console.error("Failed to load saved properties:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const applyOptimisticChange = useCallback((id, isNowSaved) => {
        setSavedIds((prev) => {
            const next = new Set(prev);
            if (isNowSaved) next.add(id);
            else next.delete(id);
            return next;
        });
    }, []);

    return { savedIds, loading, refresh, applyOptimisticChange };
}
