/**
 * Google Maps JavaScript API Loader
 * Dynamically loads the Google Maps script with Places & Marker libraries.
 */

let googleMapsPromise = null;

export function loadGoogleMaps(apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
    if (typeof window === "undefined") {
        return Promise.reject(new Error("Google Maps cannot be loaded on the server"));
    }

    // If already loaded and ready
    if (window.google && window.google.maps && window.google.maps.places) {
        return Promise.resolve(window.google.maps);
    }

    // Return existing loading promise if already in-flight
    if (googleMapsPromise) {
        return googleMapsPromise;
    }

    if (!apiKey) {
        return Promise.reject(new Error("VITE_GOOGLE_MAPS_API_KEY is not configured in .env"));
    }

    googleMapsPromise = new Promise((resolve, reject) => {
        // Check if script tag already exists
        const existingScript = document.getElementById("hyve-google-maps-script");
        if (existingScript) {
            existingScript.addEventListener("load", () => resolve(window.google.maps));
            existingScript.addEventListener("error", (err) => reject(err));
            return;
        }

        const script = document.createElement("script");
        script.id = "hyve-google-maps-script";
        script.type = "text/javascript";
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker&loading=async`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
            if (window.google && window.google.maps) {
                resolve(window.google.maps);
            } else {
                reject(new Error("Google Maps loaded but window.google.maps is undefined"));
            }
        };

        script.onerror = (err) => {
            googleMapsPromise = null;
            reject(new Error("Failed to load Google Maps script. Check your API key and network connection."));
        };

        document.head.appendChild(script);
    });

    return googleMapsPromise;
}
