
import { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Sidebar from '../Sidebar/Sidebar'
import ChatBubble from './ChatBubble';
import ConversationChatHeader from './ConversationChatHeader';
import { IoSendSharp } from "react-icons/io5";
import { getMessages, sendMessage, getCurrentUserId, openChatStream } from '../../../../../utils/chatApi';
import { hyveError } from '../../../../../utils/hyveToast';
import defaultProfileImage from "../../../../../assets/images/shared-images/user-1.png";

const Conversation = () => {
    const { chatID: roomId } = useParams();
    const currentUserId = getCurrentUserId();

    const [messages, setMessages] = useState([]);
    const [contact, setContact] = useState({ name: "Chat", avatarSrc: defaultProfileImage, phone: "" });
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

    useEffect(() => {
        let cancelled = false;
        getMessages(roomId)
            .then((data) => {
                if (cancelled) return;
                setMessages(data || []);
                // Derive contact info from whoever isn't the current user in the message history.
                const other = (data || []).find((m) => m.sender?.id !== currentUserId && m.sender?.email !== currentUserEmail)?.sender;
                if (other) {
                    setContact({
                        name: `${other.firstName || ""} ${other.lastName || ""}`.trim() || "Chat",
                        avatarSrc: other.profilePictureUrl || defaultProfileImage,
                        phone: other.phone || "",
                    });
                }
            })
            .catch((err) => {
                console.error("Failed to load messages:", err);
                hyveError("Couldn't load this conversation", "Please refresh and try again.");
            })
            .finally(() => !cancelled && setIsLoading(false));
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
    }, [roomId]);

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
                    <main className='relative w-full h-screen sm:w-[70%] lg:w-[80%] '>
                        {/* conversation header - Fixed at top */}
                        <div className="fixed top-0 left-0 right-0 z-20 bg-white sm:left-[30%] lg:left-[20%]">
                            <ConversationChatHeader contact={contact} />
                        </div>

                        {/* Conversation Body - Scrollable middle section */}
                        <div 
                            className='absolute top-[60px] bottom-[70px] left-0 right-0 overflow-y-auto px-3 sm:px-6 lg:px-4 
                            [&::-webkit-scrollbar]:w-[2px] 
                            [&::-webkit-scrollbar-track]:bg-[#D0D1DB] 
                            [&::-webkit-scrollbar-thumb]:bg-primary 
                            [&::-webkit-scrollbar-thumb]:rounded-full'
                        >
                            <div className="px-0 py-8 pb-10 space-y-3 sm:pb-10 md:px-4">
                                {isLoading ? (
                                    <p className='text-sm text-center text-[#AAAAAA]'>Loading messages...</p>
                                ) : messages.length === 0 ? (
                                    <p className='text-sm text-center text-[#AAAAAA]'>No messages yet — say hello.</p>
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
                        <div className="fixed bottom-0 left-0 right-0 px-3 sm:px-6 lg:px-8 bg-white z-20 border-t border-[#0000000D] sm:left-[30%] lg:left-[20%]">
                            <div className="flex items-center max-w-full gap-2 pt-3 pb-5 sm:gap-3 sm:pb-4 sm:pt-2">
                                {/* Text Input */}
                                <div className="flex items-center flex-1 bg-gray-100 rounded-full">
                                    <input
                                        type="text"
                                        value={draft}
                                        onChange={(e) => setDraft(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        className="flex-1 text-xs sm:text-sm placeholder-[#D0D1DB] bg-transparent border outline-none border-[#D0D1DB] rounded-lg p-3 px-2 sm:px-3 sm:p-3"
                                        placeholder="Type a message..."
                                    />
                                </div>

                                {/* send message btn */}
                                <button
                                    type="button"
                                    aria-label="send message"
                                    onClick={handleSend}
                                    disabled={!draft.trim() || isSending}
                                    className="flex items-center justify-center flex-shrink-0 w-8 h-8 text-white transition duration-200 rounded-full shadow-md outline-none bg-primary sm:w-12 sm:h-12 lg:hover:bg-primary-hover disabled:opacity-50"
                                >
                                    <IoSendSharp />
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
