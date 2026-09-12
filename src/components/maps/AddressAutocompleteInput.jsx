import { useEffect, useRef, useState, useCallback } from 'react';
import { loadGoogleMaps } from '../../utils/googleMapsLoader';
import { IoLocationOutline, IoSearchOutline } from 'react-icons/io5';
import { CheckCircle2, MapPin, Loader2, AlertCircle } from 'lucide-react';

/**
 * AddressAutocompleteInput
 * Wraps an input with Google Places Autocomplete and Geocoding.
 * Automatically resolves GPS coordinates and displays an interactive map preview.
 */
const AddressAutocompleteInput = ({
    value = '',
    latitude = null,
    longitude = null,
    onChangeAddress,
    hasError = false,
    errorMessage = '',
    placeholder = 'e.g. 18 St. Finbarrs College Road, Akoka, Yaba, Lagos'
}) => {
    const inputRef = useRef(null);
    const mapContainerRef = useRef(null);
    const googleMapInstanceRef = useRef(null);
    const markerInstanceRef = useRef(null);

    const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [apiError, setApiError] = useState(null);

    // Initialize Google Places Autocomplete
    useEffect(() => {
        let isMounted = true;

        loadGoogleMaps()
            .then((googleMaps) => {
                if (!isMounted || !inputRef.current) return;
                setIsGoogleLoaded(true);
                setApiError(null);

                const autocomplete = new googleMaps.places.Autocomplete(inputRef.current, {
                    componentRestrictions: { country: 'ng' }, // Prioritize Nigerian addresses
                    fields: ['formatted_address', 'geometry', 'name'],
                });

                autocomplete.addListener('place_changed', () => {
                    const place = autocomplete.getPlace();
                    if (!place || !place.geometry || !place.geometry.location) {
                        // Place selected without geometry; fallback to geocoding
                        handleGeocodeAddress(inputRef.current.value);
                        return;
                    }

                    const resolvedAddress = place.formatted_address || place.name || inputRef.current.value;
                    const lat = Math.round(place.geometry.location.lat() * 1000000) / 1000000;
                    const lng = Math.round(place.geometry.location.lng() * 1000000) / 1000000;

                    onChangeAddress({
                        location: resolvedAddress,
                        latitude: lat,
                        longitude: lng,
                    });
                });
            })
            .catch((err) => {
                if (!isMounted) return;
                console.warn('Google Maps not loaded (fallback geocoding active):', err.message);
                setApiError(err.message);
                setIsGoogleLoaded(false);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    // Geocode fallback function
    const handleGeocodeAddress = useCallback(async (addressQuery) => {
        const query = (addressQuery || value || '').trim();
        if (!query) return;

        setIsGeocoding(true);

        // 1. Try Google Geocoder if available
        if (window.google && window.google.maps && window.google.maps.Geocoder) {
            try {
                const geocoder = new window.google.maps.Geocoder();
                geocoder.geocode(
                    { address: query, componentRestrictions: { country: 'NG' } },
                    (results, status) => {
                        setIsGeocoding(false);
                        if (status === 'OK' && results && results[0]) {
                            const result = results[0];
                            const lat = Math.round(result.geometry.location.lat() * 1000000) / 1000000;
                            const lng = Math.round(result.geometry.location.lng() * 1000000) / 1000000;
                            onChangeAddress({
                                location: result.formatted_address || query,
                                latitude: lat,
                                longitude: lng,
                            });
                        }
                    }
                );
                return;
            } catch (e) {
                console.warn('Google geocoder error, falling back:', e);
            }
        }

        // 2. OpenStreetMap / Nominatim resilient fallback (no API key needed)
        try {
            const endpoint = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Nigeria')}&limit=1`;
            const res = await fetch(endpoint, {
                headers: { 'Accept-Language': 'en' },
            });
            const data = await res.json();
            if (data && data.length > 0) {
                const lat = Math.round(parseFloat(data[0].lat) * 1000000) / 1000000;
                const lng = Math.round(parseFloat(data[0].lon) * 1000000) / 1000000;
                onChangeAddress({
                    location: query,
                    latitude: lat,
                    longitude: lng,
                });
            }
        } catch (e) {
            console.warn('Fallback geocoding error:', e);
        } finally {
            setIsGeocoding(false);
        }
    }, [value, onChangeAddress]);

    // Update map preview when latitude & longitude change
    useEffect(() => {
        if (!latitude || !longitude || !mapContainerRef.current) return;

        // If Google Maps is available, render interactive preview map
        if (window.google && window.google.maps && window.google.maps.Map) {
            try {
                const coords = { lat: Number(latitude), lng: Number(longitude) };

                if (!googleMapInstanceRef.current) {
                    googleMapInstanceRef.current = new window.google.maps.Map(mapContainerRef.current, {
                        center: coords,
                        zoom: 16,
                        mapTypeControl: false,
                        streetViewControl: false,
                        fullscreenControl: false,
                        zoomControl: true,
                    });

                    markerInstanceRef.current = new window.google.maps.Marker({
                        position: coords,
                        map: googleMapInstanceRef.current,
                        draggable: true,
                        animation: window.google.maps.Animation.DROP,
                        title: value || 'Apartment Location',
                    });

                    // Allow landlord to drag pin to fine-tune building entrance
                    markerInstanceRef.current.addListener('dragend', () => {
                        const newPos = markerInstanceRef.current.getPosition();
                        if (newPos) {
                            onChangeAddress({
                                location: value,
                                latitude: Math.round(newPos.lat() * 1000000) / 1000000,
                                longitude: Math.round(newPos.lng() * 1000000) / 1000000,
                            });
                        }
                    });
                } else {
                    googleMapInstanceRef.current.setCenter(coords);
                    if (markerInstanceRef.current) {
                        markerInstanceRef.current.setPosition(coords);
                    }
                }
            } catch (err) {
                console.warn('Could not initialize Google Map view:', err);
            }
        }
    }, [latitude, longitude, value, onChangeAddress]);

    return (
        <div className="space-y-3">
            {/* Input with Google search styling */}
            <div className="relative">
                <span className="absolute left-3.5 top-3.5 text-[#3D3129]/50 text-base pointer-events-none">
                    <IoLocationOutline />
                </span>

                <input
                    ref={inputRef}
                    type="text"
                    id="location"
                    name="location"
                    value={value}
                    onChange={(e) => {
                        onChangeAddress({
                            location: e.target.value,
                            latitude,
                            longitude,
                        });
                    }}
                    onBlur={(e) => {
                        // If coordinates not yet determined, run geocode on blur
                        if (!latitude || !longitude) {
                            handleGeocodeAddress(e.target.value);
                        }
                    }}
                    placeholder={placeholder}
                    className={`w-full pl-9 pr-10 py-3 rounded-xl text-sm border bg-[#FAF7F5]/50 focus:bg-white outline-none smooth-transition ${
                        hasError
                            ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                            : 'border-[#3D3129]/15 focus:border-primary'
                    }`}
                />

                {isGeocoding && (
                    <span className="absolute right-3.5 top-3.5 text-primary">
                        <Loader2 className="w-4 h-4 animate-spin" />
                    </span>
                )}
            </div>

            {hasError && errorMessage && (
                <p className="text-xs text-red-500 mt-1">{errorMessage}</p>
            )}

            {/* Verification Status & Coordinates Badge */}
            <div className="flex flex-wrap items-center justify-between gap-2">
                {latitude != null && longitude != null ? (
                    <div className="inline-flex items-center gap-1.5 text-xs font-medium text-[#059669] bg-[#ECFDF5] border border-[#A7F3D0] px-3 py-1.5 rounded-lg shadow-xs">
                        <CheckCircle2 size={13} className="text-[#059669] shrink-0" />
                        <span>
                            Google Map Pinned: <strong>{latitude}° N, {longitude}° E</strong>
                        </span>
                        <span className="text-[10px] text-[#059669]/70 ml-1">(Drag pin to fine-tune)</span>
                    </div>
                ) : (
                    <div className="inline-flex items-center gap-1.5 text-xs text-[#6B7280]">
                        <MapPin size={12} className="text-primary" />
                        <span>Type your address to automatically resolve Google Map coordinates</span>
                    </div>
                )}

                {value && (!latitude || !longitude) && (
                    <button
                        type="button"
                        onClick={() => handleGeocodeAddress(value)}
                        disabled={isGeocoding}
                        className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                        {isGeocoding ? 'Resolving Pin...' : 'Find on Map'}
                    </button>
                )}
            </div>

            {/* Interactive Map Preview Card */}
            {latitude != null && longitude != null && (
                <div className="rounded-2xl overflow-hidden border border-[#E5E7EB] bg-[#F9FAFB] shadow-xs">
                    {/* Google Maps Canvas */}
                    <div
                        ref={mapContainerRef}
                        className="w-full h-44 sm:h-52 bg-gray-100 relative"
                    >
                        {/* Fallback iframe preview if JS API is waiting or offline */}
                        {(!window.google || !window.google.maps || !window.google.maps.Map) && (
                            <iframe
                                title="Property Location Map"
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                scrolling="no"
                                marginHeight="0"
                                marginWidth="0"
                                src={`https://maps.google.com/maps?q=${latitude},${longitude}&hl=en&z=15&output=embed`}
                            />
                        )}
                    </div>
                    <div className="px-3.5 py-2 bg-white border-t border-[#E5E7EB] flex items-center justify-between text-[11px] text-[#6B7280]">
                        <span className="font-medium text-[#1F2937] truncate max-w-[80%]">
                            📍 {value || 'Pinned Location'}
                        </span>
                        <a
                            href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary hover:underline shrink-0 font-medium"
                        >
                            Open in Google Maps
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddressAutocompleteInput;
