// Real notification calls against the live backend, replacing the localStorage
// version (utils/notifications.js is now unused by Notifications.jsx — kept in the
// repo harmlessly in case anything else still imports it, but this is the source of truth).
import config from "../config";

export async function getNotifications({ unreadOnly = false } = {}) {
    const res = await config.getAPI({ url: "/api/v1/notifications", params: { unreadOnly } });
    if (!res?.success) throw new Error(res?.message || "Failed to load notifications");
    return res.data; // Notification[]
}

export async function markNotificationAsRead(id) {
    const res = await config.allAPI({ url: `/api/v1/notifications/${id}/read`, method: "PUT", params: {} });
    if (!res?.success) throw new Error(res?.message || "Failed to mark notification as read");
    return res.data;
}

export async function markAllNotificationsAsRead() {
    const res = await config.allAPI({ url: "/api/v1/notifications/read-all", method: "PUT", params: {} });
    if (!res?.success) throw new Error(res?.message || "Failed to mark all as read");
    return true;
}
