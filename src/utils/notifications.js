// Temporary client-side "read/unread" store for notifications, same pattern as
// utils/savedLodges.js. Backed by localStorage so it survives refresh.
// Swap markAsRead()/getReadIds() for real API calls (config.getAPI/config.postAPI)
// once GET /notifications and POST /notifications/:id/read exist on the backend —
// component usage (isRead/markAsRead) won't need to change.

const STORAGE_KEY = "hyve_read_notification_ids";
const EVENT_NAME = "hyve:notifications-changed";

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
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

export function getReadIds() {
    return readIds();
}

export function isRead(notificationId) {
    return readIds().includes(Number(notificationId));
}

export function markAsRead(notificationId) {
    const id = Number(notificationId);
    const ids = readIds();
    if (!ids.includes(id)) {
        writeIds([...ids, id]);
    }
}

export function markAllAsRead(allIds) {
    writeIds([...new Set(allIds.map(Number))]);
}

export function subscribeToNotificationChanges(callback) {
    window.addEventListener(EVENT_NAME, callback);
    window.addEventListener("storage", callback); // cross-tab
    return () => {
        window.removeEventListener(EVENT_NAME, callback);
        window.removeEventListener("storage", callback);
    };
}
