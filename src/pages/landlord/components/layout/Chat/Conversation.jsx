import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import ChatBubble from "./ChatBubble";
import ConversationChatHeader from "./ConversationChatHeader";
import { IoSendSharp } from "react-icons/io5";
import {
  getMessages,
  sendMessage,
  getChatRoom,
  getChatRooms,
  getCurrentUserId,
  openChatStream,
} from "../../../../../utils/chatApi";
import { hyveError } from "../../../../../utils/hyveToast";
import defaultProfileImage from "../../../../../assets/images/shared-images/user-1.png";
import { Loader2 } from "lucide-react";

const LandlordConversation = () => {
  const { chatID: roomId } = useParams();
  const currentUserId = getCurrentUserId();

  const [messages, setMessages] = useState([]);
  const [contact, setContact] = useState({
    name: "Prospective Tenant",
    avatarSrc: defaultProfileImage,
    phone: "",
    isOnline: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef(null);

  const currentUserEmail = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"))?.email;
    } catch {
      return null;
    }
  })();

  // Helper to extract the other participant
  const resolveOtherParticipant = (participants, messageList) => {
    if (Array.isArray(participants) && participants.length > 0) {
      const found = participants.find(
        (p) => p.id !== currentUserId && p.email !== currentUserEmail,
      );
      if (found) return found;
    }

    if (Array.isArray(messageList) && messageList.length > 0) {
      const foundMsg = messageList.find(
        (m) =>
          m.sender?.id !== currentUserId &&
          m.sender?.email !== currentUserEmail,
      );
      if (foundMsg?.sender) return foundMsg.sender;
    }

    return null;
  };

  // Fetch initial messages and determine participant contact details
  useEffect(() => {
    let cancelled = false;

    const loadConversation = async () => {
      setIsLoading(true);
      try {
        // Fetch messages and room metadata in parallel
        const [msgData, roomData] = await Promise.all([
          getMessages(roomId).catch(() => []),
          getChatRoom(roomId).catch(() => null),
        ]);

        if (cancelled) return;
        setMessages(msgData || []);

        // Determine the other participant
        let other = resolveOtherParticipant(roomData?.participants, msgData);

        // Fallback: search getChatRooms list
        if (!other) {
          const allRooms = await getChatRooms().catch(() => []);
          const matchedRoom = allRooms.find(
            (r) => String(r.id) === String(roomId),
          );
          other = resolveOtherParticipant(matchedRoom?.participants, msgData);
        }

        if (other) {
          const fullName =
            `${other.firstName || ""} ${other.lastName || ""}`.trim();
          setContact({
            name: fullName || "Prospective Tenant",
            avatarSrc: other.profilePictureUrl || defaultProfileImage,
            phone: other.phone || "",
            isOnline: Boolean(other.online),
            role: other.role,
            subtitle:
              other.phone ||
              (other.role === "TENANT" ? "Prospective Tenant" : "User"),
          });
        }
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to load landlord conversation:", err);
        hyveError(
          "Couldn't load conversation",
          err?.message || "Please refresh and try again.",
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadConversation();
    return () => {
      cancelled = true;
    };
  }, [roomId, currentUserId, currentUserEmail]);

  // Live real-time delivery via SSE stream
  useEffect(() => {
    const source = openChatStream(
      (payload) => {
        const targetRoomId = payload?.chatRoom?.id ?? payload?.roomId;
        if (String(targetRoomId) === String(roomId)) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === payload.id)) return prev;
            return [...prev, payload];
          });

          // Update contact name if previously generic
          if (
            payload.sender &&
            payload.sender.id !== currentUserId &&
            payload.sender.email !== currentUserEmail
          ) {
            const s = payload.sender;
            const fullName = `${s.firstName || ""} ${s.lastName || ""}`.trim();
            if (fullName) {
              setContact((prev) => ({
                ...prev,
                name: fullName,
                avatarSrc: s.profilePictureUrl || prev.avatarSrc,
                phone: s.phone || prev.phone,
                isOnline: true,
              }));
            }
          }
        }
      },
      (err) => console.warn("Landlord chat stream warning:", err),
    );

    // Fallback polling every 4 seconds to guarantee zero missed messages
    const pollInterval = setInterval(() => {
      getMessages(roomId)
        .then((fresh) => {
          if (Array.isArray(fresh)) {
            setMessages((prev) => (fresh.length > prev.length ? fresh : prev));
          }
        })
        .catch(() => {});
    }, 4000);

    return () => {
      source?.close();
      clearInterval(pollInterval);
    };
  }, [roomId, currentUserId, currentUserEmail]);

  // Scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send a message
  const handleSend = async () => {
    const text = draft.trim();
    if (!text || isSending) return;

    setIsSending(true);
    setDraft("");

    try {
      const sent = await sendMessage(roomId, text);
      setMessages((prev) => {
        if (prev.some((m) => m.id === sent.id)) return prev;
        return [...prev, sent];
      });
    } catch (err) {
      console.error("Failed to send message:", err);
      hyveError("Message not sent", err?.message || "Please try again.");
      setDraft(text); // Preserve text on failure
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="page-wrapper">
      <div className="flex">
        {/* Dashboard sidebar */}
        <Sidebar currentPage={"chats"} />

        {/* Dashboard content area */}
        <main className="relative w-full h-[100svh] sm:w-[70%] lg:w-[80%] flex flex-col bg-[#FAF7F5]/40">
          {/* Conversation Header */}
          <ConversationChatHeader contact={contact} />

          {/* Conversation Messages Body */}
          <div className="flex-1 overflow-y-auto px-3 sm:px-6 lg:px-8 py-4 space-y-2.5">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full py-20">
                <div className="spinner w-[30px] h-[30px]"></div>
                <p className="text-xs text-[#888888] font-poppins mt-3">
                  Loading messages...
                </p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-20 text-center px-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl mb-2">
                  💬
                </div>
                <h4 className="font-poppins font-semibold text-sm text-[#3D3129]">
                  Start of conversation
                </h4>
                <p className="text-xs text-[#888888] max-w-xs mt-1">
                  Send a message to introduce yourself or respond to inquiries
                  about your property.
                </p>
              </div>
            ) : (
              <div className="py-2">
                {messages.map((msg) => (
                  <ChatBubble
                    key={msg.id}
                    message={msg.content}
                    isSender={msg.sender?.id === currentUserId}
                    timestamp={msg.createdAt}
                  />
                ))}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* Fixed Message Input Bar */}
          <div className="p-3 sm:p-4 bg-white border-t border-[#0000000D] shadow-sm">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2 sm:gap-3 max-w-5xl mx-auto"
            >
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your reply to this user..."
                className="flex-1 text-xs sm:text-sm px-4 py-3 bg-[#FAF7F5] border border-[#3D3129]/15 rounded-xl outline-none focus:border-primary focus:bg-white transition-colors"
              />

              <button
                type="submit"
                disabled={!draft.trim() || isSending}
                aria-label="Send message"
                className="w-11 h-11 rounded-xl bg-primary hover:bg-primary-hover text-white flex items-center justify-center flex-shrink-0 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <IoSendSharp className="text-base" />
                )}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LandlordConversation;
