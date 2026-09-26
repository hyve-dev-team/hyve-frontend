// Real chat calls against the live backend. Includes a helper to open the SSE
// stream for live message delivery (EventSource can't send custom headers, so the
// token goes as a query param — this matches what the Swagger docs say is supported).
import config from "../config";

export async function getChatRooms() {
  const res = await config.getAPI({ url: "/api/v1/chat/rooms" });
  if (!res?.success) throw new Error(res?.message || "Failed to load chats");
  return res.data; // ChatRoom[]
}

export async function getChatRoom(roomId) {
  try {
    const res = await config.getAPI({ url: `/api/v1/chat/rooms/${roomId}` });
    if (res?.success && res.data) return res.data;
  } catch {
    // Fallback: search within getChatRooms()
    const all = await getChatRooms();
    return all.find((r) => String(r.id) === String(roomId)) || null;
  }
  return null;
}

export async function createOrGetChatRoom(recipientId) {
  const res = await config.postAPI({
    url: `/api/v1/chat/rooms?recipientId=${encodeURIComponent(recipientId)}`,
    params: { recipientId },
  });
  if (!res?.success) throw new Error(res?.message || "Failed to open chat");
  return res.data; // ChatRoom
}

export async function getMessages(roomId) {
  const res = await config.getAPI({
    url: `/api/v1/chat/rooms/${roomId}/messages`,
  });
  if (!res?.success) throw new Error(res?.message || "Failed to load messages");
  return res.data; // ChatMessage[]
}

export async function sendMessage(roomId, content) {
  const res = await config.postAPI({
    url: `/api/v1/chat/rooms/${roomId}/messages`,
    params: { content },
  });
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
  const streamUrl = `${baseURL}/api/v1/chat/stream?token=${encodeURIComponent(token)}`;
  let source = null;

  try {
    source = new EventSource(streamUrl);

    const handleData = (event) => {
      if (!event?.data || event.data === "Connected") return;
      try {
        const parsed = JSON.parse(event.data);
        onMessage(parsed);
      } catch {
        onMessage(event.data);
      }
    };

    source.onmessage = handleData;
    source.addEventListener("message", handleData);
    source.addEventListener("init", (event) => {
      console.log("Chat SSE stream connected:", event.data);
    });

    source.onerror = (err) => {
      console.warn("Chat SSE stream connection state changed:", err);
      onError?.(err);
    };
  } catch (e) {
    console.error("Could not initialize EventSource:", e);
    onError?.(e);
  }

  return source;
}
