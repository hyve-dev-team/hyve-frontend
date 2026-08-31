// Temporary client-side "saved lodges" store.
// Backed by localStorage so it survives refresh. Swap this out for real API
// calls (config.postAPI / config.getAPI) once the backend has save/unsave
// endpoints — the component-side usage (isSaved/toggleSaved) won't need to change,
// just what happens inside these two functions.

const STORAGE_KEY = "hyve_saved_lodge_ids";
const EVENT_NAME = "hyve:saved-lodges-changed";

function readIds() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function writeIds(ids) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    // Let other mounted components (e.g. Dashboard + Saved page open in different tabs of the same app)
    // know the saved list changed, since localStorage alone doesn't trigger a re-render.
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

export function getSavedIds() {
    return readIds();
}

export function isSaved(lodgeId) {
    return readIds().includes(Number(lodgeId));
}

export function toggleSaved(lodgeId) {
    const id = Number(lodgeId);
    const ids = readIds();
    const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
    writeIds(next);
    return next.includes(id);
}

export function subscribeToSavedChanges(callback) {
    window.addEventListener(EVENT_NAME, callback);
    window.addEventListener("storage", callback); // cross-tab
    return () => {
        window.removeEventListener(EVENT_NAME, callback);
        window.removeEventListener("storage", callback);
    };
}

export const SAVED_LODGES_EVENT = EVENT_NAME;
