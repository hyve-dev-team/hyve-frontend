"use client"
import { useState, useEffect } from 'react';
// import axios from 'axios';
import featuredLodges from '../utils/featuredLodges';


const useFetchApartment = (apartmentID) => {
    const [apartment, setApartment] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setIsLoading(true);
        setError(null);

        // Check if the ID is available before fetching
        if (!apartmentID) {
            setError("No apartment ID found in the URL.");
            setIsLoading(false);
            return;
        }

        // const fetchApartment = async () => {
        //     try {
        //         setIsLoading(true);
        //         setError(null);

        //         // API URL for the single apartment
        //         const url = ``;

        //         // Perform the GET request
        //         const response = await axios.get(url);
        //         setApartment(response.data);
        //     } catch (err) {
        //         console.error("Error fetching apartment:", err);
        //         setError("Failed to load apartment details. Please try again.");
        //     } finally {
        //         setIsLoading(false);
        //     }
        // };

        const fetchDummyApartment = async () => {
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
                    const notFoundError = `Apartment with ID ${apartmentID} Not found.`;
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

        // fetchApartment();
        fetchDummyApartment()
    }, [apartmentID]);
    return { apartment, isLoading, error };
};

export default useFetchApartment;