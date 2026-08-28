// Tracks the tenant's currently-booked apartment, set once a Reservation payment
// completes. Backed by localStorage until a real "my current lodge" endpoint
// exists on the backend. This is what CurrentLodgeCard/ManageApartment read from
// instead of the previously hardcoded "Lid Lodge" placeholder.

const STORAGE_KEY = "hyve_current_lodge";
const EVENT_NAME = "hyve:current-lodge-changed";

export function getCurrentLodge() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function setCurrentLodge(lodge) {
    // lodge: { apartmentId, name, rentExpiryDate }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lodge));
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

export function clearCurrentLodge() {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

export function subscribeToCurrentLodgeChanges(callback) {
    window.addEventListener(EVENT_NAME, callback);
    window.addEventListener("storage", callback);
    return () => {
        window.removeEventListener(EVENT_NAME, callback);
        window.removeEventListener("storage", callback);
    };
}
