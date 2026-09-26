import { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Sidebar from '../Sidebar/Sidebar'
import ChatBubble from './ChatBubble';
import ConversationChatHeader from './ConversationChatHeader';
import { IoSendSharp } from "react-icons/io5";
import { getMessages, sendMessage, getChatRoom, getChatRooms, getCurrentUserId, openChatStream } from '../../../../../utils/chatApi';
import { hyveError } from '../../../../../utils/hyveToast';
import defaultProfileImage from "../../../../../assets/images/shared-images/user-1.png";

const Conversation = () => {
    const { chatID: roomId } = useParams();
    const currentUserId = getCurrentUserId();

    const [messages, setMessages] = useState([]);
    const [contact, setContact] = useState({
        name: "Landlord Host",
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

    // Helper to extract the other participant from a user object or participant list
    const resolveOtherParticipant = (participants, messageList) => {
        // 1. Try finding from room participants
        if (Array.isArray(participants) && participants.length > 0) {
            const found = participants.find((p) => p.id !== currentUserId && p.email !== currentUserEmail);
            if (found) return found;
        }

        // 2. Try finding from message history
        if (Array.isArray(messageList) && messageList.length > 0) {
            const foundMsg = messageList.find((m) => m.sender?.id !== currentUserId && m.sender?.email !== currentUserEmail);
            if (foundMsg?.sender) return foundMsg.sender;
        }

        return null;
    };

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

                // If still not found, check getChatRooms list
                if (!other) {
                    const allRooms = await getChatRooms().catch(() => []);
                    const matchedRoom = allRooms.find((r) => String(r.id) === String(roomId));
                    other = resolveOtherParticipant(matchedRoom?.participants, msgData);
                }

                if (other) {
                    const fullName = `${other.firstName || ""} ${other.lastName || ""}`.trim();
                    setContact({
                        name: fullName || (other.role === "LANDLORD" ? "Landlord Host" : "Property Host"),
                        avatarSrc: other.profilePictureUrl || defaultProfileImage,
                        phone: other.phone || "",
                        isOnline: Boolean(other.online),
                        role: other.role,
                        subtitle: other.role === "LANDLORD" ? "Property Host • Verified" : (other.phone || "User"),
                    });
                }
            } catch (err) {
                if (cancelled) return;
                console.error("Failed to load conversation:", err);
                hyveError("Couldn't load this conversation", "Please refresh and try again.");
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        loadConversation();
        return () => { cancelled = true; };
    }, [roomId, currentUserId, currentUserEmail]);

    // Live delivery: listen on the SSE stream for new messages in this room.
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
                    if (payload.sender && payload.sender.id !== currentUserId && payload.sender.email !== currentUserEmail) {
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
            (err) => console.warn("Tenant chat stream status:", err)
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

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

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
            hyveError("Message not sent", "Please try again.");
            setDraft(text);
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
        <>
            <div className='page-wrapper'>
                <div className='flex'>
                    {/* dashboard sidebar*/}
                    <Sidebar currentPage={"chats"} />

                    {/* dashboard content area */}
                    <main className='relative w-full h-screen sm:w-[70%] lg:w-[80%] flex flex-col bg-[#FAF7F5]/30'>
                        {/* conversation header - Fixed at top with Back Button & Recipient Details */}
                        <div className="sticky top-0 left-0 right-0 z-20 bg-white">
                            <ConversationChatHeader contact={contact} backTo="/user/chats" />
                        </div>

                        {/* Conversation Body - Scrollable middle section */}
                        <div 
                            className='flex-1 overflow-y-auto px-3 sm:px-6 lg:px-8 py-4 space-y-3
                            [&::-webkit-scrollbar]:w-[2px] 
                            [&::-webkit-scrollbar-track]:bg-[#D0D1DB] 
                            [&::-webkit-scrollbar-thumb]:bg-primary 
                            [&::-webkit-scrollbar-thumb]:rounded-full'
                        >
                            <div className="px-0 py-4 pb-10 space-y-3 sm:pb-10 md:px-4">
                                {isLoading ? (
                                    <div className="flex flex-col items-center justify-center py-20">
                                        <div className="spinner w-[30px] h-[30px]" />
                                        <p className="text-xs text-[#888888] font-poppins mt-3">Loading messages...</p>
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl mb-2">
                                            💬
                                        </div>
                                        <h4 className="font-poppins font-semibold text-sm text-gray-900">
                                            Chat with {contact.name}
                                        </h4>
                                        <p className="text-xs text-gray-500 max-w-xs mt-1">
                                            Ask questions about the property, schedule a private tour, or discuss rental arrangements.
                                        </p>
                                    </div>
                                ) : (
                                    messages.map((msg) => (
                                        <ChatBubble
                                            key={msg.id}
                                            message={msg.content}
                                            timestamp={msg.createdAt}
                                            isSender={msg.sender?.id === currentUserId || (currentUserEmail && msg.sender?.email === currentUserEmail)}
                                        />
                                    ))
                                )}
                                <div ref={bottomRef} />
                            </div>
                        </div>

                        {/* Message Input Area - Fixed at bottom */}
                        <div className="sticky bottom-0 left-0 right-0 px-3 sm:px-6 lg:px-8 py-3 bg-white z-20 border-t border-[#0000000D] shadow-sm">
                            <div className="flex items-center max-w-full gap-2 sm:gap-3">
                                {/* Text Input */}
                                <div className="flex items-center flex-1 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-primary focus-within:bg-white transition-colors">
                                    <input
                                        type="text"
                                        value={draft}
                                        onChange={(e) => setDraft(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        className="flex-1 text-xs sm:text-sm placeholder-[#9CA3AF] bg-transparent outline-none p-3 px-3.5"
                                        placeholder={`Message ${contact.name}...`}
                                    />
                                </div>

                                {/* send message btn */}
                                <button
                                    type="button"
                                    aria-label="send message"
                                    onClick={handleSend}
                                    disabled={!draft.trim() || isSending}
                                    className="flex items-center justify-center flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 text-white transition duration-200 rounded-xl shadow-sm outline-none bg-primary hover:bg-primary-hover disabled:opacity-50 cursor-pointer"
                                >
                                    <IoSendSharp className="text-base" />
                                </button>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    )
}

export default Conversation
