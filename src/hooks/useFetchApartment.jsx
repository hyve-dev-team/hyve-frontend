"use client"
import { useState, useEffect } from 'react';
import { getPropertyById } from '../utils/propertiesApi';
import { mapProperty } from '../utils/mapProperty';

const useFetchApartment = (apartmentID) => {
    const [apartment, setApartment] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setIsLoading(true);
        setError(null);

        if (!apartmentID) {
            setError("No apartment ID found in the URL.");
            setIsLoading(false);
            return;
        }

        let cancelled = false;

        const fetchApartment = async () => {
            try {
                const property = await getPropertyById(apartmentID);
                if (cancelled) return;
                setApartment(mapProperty(property));
            } catch (err) {
                if (cancelled) return;
                console.error("Error fetching apartment:", err);
                setError(err.message || "Failed to load apartment details. Please try again.");
                setApartment(null);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        fetchApartment();
        return () => { cancelled = true; };
    }, [apartmentID]);

    return { apartment, isLoading, error };
};

export default useFetchApartment;
