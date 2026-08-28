
import { useEffect, useState } from 'react'
import { getPropertyById } from '../utils/propertiesApi';
import { mapProperty } from '../utils/mapProperty';

// Reviews come embedded on the Property object itself (real API doesn't have a
// separate reviews-by-property endpoint), so this hook just fetches the property
// and hands back the same mapped shape as useFetchApartment — kept as a separate
// hook since ApartmentReviews.jsx already imports it under this name.
const useFetchReviews = (apartmentID) => {
  const [apartment, setApartment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    if (!apartmentID) {
      setError("Not Found!");
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const fetchApartmentReviews = async () => {
      try {
        const property = await getPropertyById(apartmentID);
        if (cancelled) return;
        setApartment(mapProperty(property));
      } catch (err) {
        if (cancelled) return;
        console.error("Error fetching apartment reviews:", err);
        setError(err.message || "Apartment Not Found!");
        setApartment(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchApartmentReviews();
    return () => { cancelled = true; };
  }, [apartmentID]);
  return { apartment, isLoading, error };
}

export default useFetchReviews
