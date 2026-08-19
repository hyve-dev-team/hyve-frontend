import React, { useEffect, useState } from 'react'
import featuredLodges from '../utils/featuredLodges';

const useFetchReviews = (apartmentID) => {
  const [apartment, setApartment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    // Check if the ID is available before fetching
    if (!apartmentID) {
      setError("Not Found!");
      setIsLoading(false);
      return;
    }

    // stimulated data fetching
    const fetchDummyApartmentReview = async () => {
      try {
        // Stimulated network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Ensure apartmentId is a number
        const idToFind = Number(apartmentID);

        // Find the apartment where the ID matches
        const response = featuredLodges.find(lodge => lodge.id === idToFind);

        if (response) {
          setApartment(response);
        } else {
          const notFoundError = `Apartment Not Found!`;
          setError(notFoundError);
          setApartment(null);
        }

      } catch (err) {
        // Catch any unexpected errors during processing
        setError("An unexpected error occurred.");
        setApartment(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDummyApartmentReview()
  }, [apartmentID]);
  return { apartment, isLoading, error };
}

export default useFetchReviews