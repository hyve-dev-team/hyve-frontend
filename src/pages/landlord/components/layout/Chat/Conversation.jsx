import { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import ChatBubble from './ChatBubble';
import ConversationChatHeader from './ConversationChatHeader';
import { IoSendSharp, IoArrowBack } from "react-icons/io5";
import { getMessages, sendMessage, getChatRooms, getCurrentUserId, openChatStream } from '../../../../../utils/chatApi';
import { hyveError } from '../../../../../utils/hyveToast';
import defaultProfileImage from "../../../../../assets/images/shared-images/user-1.png";
import { Loader2 } from 'lucide-react';

const LandlordConversation = () => {
    const { chatID: roomId } = useParams();
    const currentUserId = getCurrentUserId();

    const [messages, setMessages] = useState([]);
    const [contact, setContact] = useState({
        name: "Tenant",
        avatarSrc: defaultProfileImage,
        phone: "",
        isOnline: false,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [draft, setDraft] = useState("");
    const [isSending, setIsSending] = useState(false);
    const bottomRef = useRef(null);

    // Fetch initial messages and determine participant contact details
    useEffect(() => {
        let cancelled = false;

        const loadConversation = async () => {
            setIsLoading(true);
            try {
                // 1. Fetch messages in this room
                const msgData = await getMessages(roomId);
                if (cancelled) return;
                setMessages(msgData || []);

                // 2. Identify the other participant from messages or from chat rooms
                const otherFromMsg = (msgData || []).find((m) => m.sender?.id !== currentUserId)?.sender;
                if (otherFromMsg) {
                    setContact({
                        name: `${otherFromMsg.firstName || ""} ${otherFromMsg.lastName || ""}`.trim() || "User",
                        avatarSrc: otherFromMsg.profilePictureUrl || defaultProfileImage,
                        phone: otherFromMsg.phone || "",
                        isOnline: Boolean(otherFromMsg.online),
                    });
                } else {
                    // If room has no messages yet, find the participant from room metadata
                    const allRooms = await getChatRooms();
                    if (cancelled) return;
                    const thisRoom = allRooms.find((r) => String(r.id) === String(roomId));
                    const otherUser = thisRoom?.participants?.find((p) => p.id !== currentUserId) || thisRoom?.participants?.[0];
                    if (otherUser) {
                        setContact({
                            name: `${otherUser.firstName || ""} ${otherUser.lastName || ""}`.trim() || "User",
                            avatarSrc: otherUser.profilePictureUrl || defaultProfileImage,
                            phone: otherUser.phone || "",
                            isOnline: Boolean(otherUser.online),
                        });
                    }
                }
            } catch (err) {
                if (cancelled) return;
                console.error("Failed to load landlord conversation:", err);
                hyveError("Couldn't load conversation", err?.message || "Please refresh and try again.");
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        loadConversation();
        return () => { cancelled = true; };
    }, [roomId, currentUserId]);

    // Live real-time delivery via SSE stream
    useEffect(() => {
        const source = openChatStream(
            (payload) => {
                if (
                    payload?.chatRoom?.id === Number(roomId) ||
                    payload?.roomId === Number(roomId)
                ) {
                    setMessages((prev) => {
                        if (prev.some((m) => m.id === payload.id)) return prev;
                        return [...prev, payload];
                    });
                }
            },
            (err) => console.error("Landlord chat stream error:", err)
        );

        return () => source?.close();
    }, [roomId]);

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
        <div className='page-wrapper'>
            <div className='flex'>
                {/* Dashboard sidebar */}
                <Sidebar currentPage={"chats"} />

                {/* Dashboard content area */}
                <main className='relative w-full h-[100svh] sm:w-[70%] lg:w-[80%] flex flex-col bg-[#FAF7F5]/40'>
                    {/* Conversation Header */}
                    <ConversationChatHeader contact={contact} />

                    {/* Conversation Messages Body */}
                    <div className='flex-1 overflow-y-auto px-3 sm:px-6 lg:px-8 py-4 space-y-2.5'>
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-full py-20">
                                <div className="spinner w-[30px] h-[30px]"></div>
                                <p className="text-xs text-[#888888] font-poppins mt-3">Loading messages...</p>
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
                                    Send a message to introduce yourself or respond to inquiries about your property.
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