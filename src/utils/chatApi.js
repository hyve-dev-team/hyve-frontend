// Real chat calls against the live backend. Includes a helper to open the SSE
// stream for live message delivery (EventSource can't send custom headers, so the
// token goes as a query param — this matches what the Swagger docs say is supported).
import config from "../config";

export async function getChatRooms() {
    const res = await config.getAPI({ url: "/api/v1/chat/rooms" });
    if (!res?.success) throw new Error(res?.message || "Failed to load chats");
    return res.data; // ChatRoom[]
}

export async function createOrGetChatRoom(recipientId) {
    const res = await config.postAPI({ url: "/api/v1/chat/rooms", params: { recipientId } });
    if (!res?.success) throw new Error(res?.message || "Failed to open chat");
    return res.data; // ChatRoom
}

export async function getMessages(roomId) {
    const res = await config.getAPI({ url: `/api/v1/chat/rooms/${roomId}/messages` });
    if (!res?.success) throw new Error(res?.message || "Failed to load messages");
    return res.data; // ChatMessage[]
}

export async function sendMessage(roomId, content) {
    const res = await config.postAPI({ url: `/api/v1/chat/rooms/${roomId}/messages`, params: { content } });
    if (!res?.success) throw new Error(res?.message || "Failed to send message");
    return res.data; // ChatMessage
}

export function getCurrentUserId() {
    try {
        const user = JSON.parse(localStorage.getItem("user"));
        return user?.id ?? null;
    } catch {
        return null;
    }
}

// Opens the live SSE stream. Returns the EventSource so the caller can close it
// on unmount. `onMessage` receives each parsed event payload.
export function openChatStream(onMessage, onError) {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const baseURL = config.baseURL;
    const source = new EventSource(`${baseURL}/api/v1/chat/stream?token=${encodeURIComponent(token)}`);

    source.onmessage = (event) => {
        try {
            onMessage(JSON.parse(event.data));
        } catch {
            onMessage(event.data);
        }
    };
    source.onerror = (err) => {
        onError?.(err);
    };

    return source;
}
