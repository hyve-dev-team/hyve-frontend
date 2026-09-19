import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import AdminHeader from '../../components/layout/AdminHeader';
import config from '../../config';
import { hyveSuccess, hyveError } from '../../utils/hyveToast';

import {
    FiSend,
    FiMessageSquare,
    FiUsers,
    FiInfo,
    FiRefreshCw,
    FiClock,
    FiUser,
    FiAlertCircle,
    FiCheckCircle
} from 'react-icons/fi';
import { HiOutlineMegaphone } from 'react-icons/hi2';
import { IoCloseOutline } from 'react-icons/io5';

const AdminMessages = () => {
    const [chatRooms, setChatRooms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Broadcast state
    const [broadcastTitle, setBroadcastTitle] = useState('');
    const [broadcastMessage, setBroadcastMessage] = useState('');
    const [broadcastTarget, setBroadcastTarget] = useState('ALL'); // ALL, STUDENT, LANDLORD
    const [isBroadcasting, setIsBroadcasting] = useState(false);

    // Selected conversation inspection
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);

    useEffect(() => {
        fetchChatRooms();
    }, []);

    const fetchChatRooms = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const res = await config.getAPI({
                url: '/api/v1/admin/chats'
            });

            if (res?.success && Array.isArray(res?.data)) {
                setChatRooms(res.data);
            } else {
                setChatRooms([]);
                if (res?.message) {
                    setError(res.message);
                }
            }
        } catch (err) {
            console.error('Failed to load chat rooms:', err);
            setError(err?.message || 'Unable to retrieve chat conversations from server.');
            setChatRooms([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectRoom = async (room) => {
        setSelectedRoom(room);
        setIsLoadingMessages(true);
        try {
            const res = await config.getAPI({
                url: `/api/v1/admin/chats/${room.id}/messages`
            });

            if (res?.success && Array.isArray(res?.data)) {
                setMessages(res.data);
            } else {
                setMessages([]);
            }
        } catch (err) {
            console.error('Failed to load messages for room:', err);
            setMessages([]);
        } finally {
            setIsLoadingMessages(false);
        }
    };

    const handleSendBroadcast = async (e) => {
        e.preventDefault();
        if (!broadcastMessage.trim()) {
            hyveError('Validation Error', 'Please enter a message content to broadcast.');
            return;
        }

        setIsBroadcasting(true);
        try {
            const res = await config.postAPI({
                url: '/api/v1/admin/broadcast',
                params: {
                    title: broadcastTitle.trim() || 'System Announcement',
                    message: broadcastMessage.trim(),
                    target: broadcastTarget
                }
            });

            if (res?.success) {
                hyveSuccess(
                    'Announcement Broadcasted',
                    `Alert successfully dispatched to ${res.data?.recipientsCount || 'all'} registered accounts.`
                );
                setBroadcastTitle('');
                setBroadcastMessage('');
            } else {
                hyveError('Broadcast Failed', res?.message || 'Could not send broadcast announcement');
            }
        } catch (err) {
            console.error('Broadcast failed:', err);
            hyveError('Error', err?.message || 'An error occurred while broadcasting');
        } finally {
            setIsBroadcasting(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return '-';
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + d.toLocaleDateString();
        } catch {
            return '-';
        }
    };

    // Filter chat rooms by search
    const filteredRooms = chatRooms.filter((r) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        const student = (r.studentName || '') + ' ' + (r.studentEmail || '');
        const landlord = (r.landlordName || '') + ' ' + (r.landlordEmail || '');
        const lastMsg = r.lastMessage || '';
        return student.toLowerCase().includes(q) || landlord.toLowerCase().includes(q) || lastMsg.toLowerCase().includes(q);
    });

    return (
        <AdminLayout>
            <AdminHeader
                title="Messages & Inquiries"
                showWavingHand={false}
                searchValue={searchQuery}
                onSearch={setSearchQuery}
            />

            <main className="p-6 sm:p-10 space-y-8 max-w-7xl">
                {/* Error Banner with Retry */}
                {error && (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                            <FiInfo className="text-base text-amber-600 shrink-0" />
                            <span>{error}</span>
                        </div>
                        <button
                            type="button"
                            onClick={fetchChatRooms}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-200/80 hover:bg-amber-300 font-bold transition-colors cursor-pointer"
                        >
                            <FiRefreshCw className="text-xs" />
                            <span>Retry</span>
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: System Broadcast Composer */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-[#FFF2EA] text-[#FA6400] flex items-center justify-center text-xl shadow-xs">
                                    <HiOutlineMegaphone />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-stone-900 font-poppins">
                                        Broadcast Alert
                                    </h2>
                                    <p className="text-xs text-stone-400">
                                        Send push & in-app announcements to users.
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs">
                                <div>
                                    <label className="block font-semibold text-stone-700 mb-1">
                                        Target Audience
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { label: 'All Users', value: 'ALL' },
                                            { label: 'Students', value: 'STUDENT' },
                                            { label: 'Landlords', value: 'LANDLORD' }
                                        ].map((t) => (
                                            <button
                                                key={t.value}
                                                type="button"
                                                onClick={() => setBroadcastTarget(t.value)}
                                                className={`py-2 px-3 rounded-xl font-bold border transition-all cursor-pointer ${
                                                    broadcastTarget === t.value
                                                        ? 'bg-[#FA6400] text-white border-[#FA6400] shadow-sm'
                                                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                                                }`}
                                            >
                                                {t.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-semibold text-stone-700 mb-1">
                                        Announcement Title
                                    </label>
                                    <input
                                        type="text"
                                        value={broadcastTitle}
                                        onChange={(e) => setBroadcastTitle(e.target.value)}
                                        placeholder="e.g. System Maintenance or New Policy Update"
                                        className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-[#FA6400] focus:bg-white transition-all text-stone-800 text-xs"
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-stone-700 mb-1">
                                        Message Content
                                    </label>
                                    <textarea
                                        value={broadcastMessage}
                                        onChange={(e) => setBroadcastMessage(e.target.value)}
                                        placeholder="Type your official platform message here..."
                                        rows={4}
                                        className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-[#FA6400] focus:bg-white transition-all text-stone-800 text-xs"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isBroadcasting}
                                    className="w-full py-3.5 bg-[#FA6400] hover:bg-[#e05a00] text-white rounded-xl font-bold text-xs shadow-md shadow-[#FA6400]/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                                >
                                    <FiSend />
                                    <span>{isBroadcasting ? 'Dispatching...' : 'Broadcast Now'}</span>
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Right Column: Platform Conversations Oversight */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-5">
                            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shadow-xs">
                                        <FiMessageSquare />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-bold text-stone-900 font-poppins">
                                            Conversation Moderation
                                        </h2>
                                        <p className="text-xs text-stone-400">
                                            Monitor live discussions between students and property hosts.
                                        </p>
                                    </div>
                                </div>

                                <span className="text-xs font-bold text-stone-500 bg-stone-100 px-3 py-1 rounded-full">
                                    {chatRooms.length} Threads
                                </span>
                            </div>

                            {/* Thread list */}
                            <div className="space-y-3">
                                {isLoading ? (
                                    <div className="py-16 text-center">
                                        <div className="w-8 h-8 border-2 border-[#FA6400]/20 border-t-[#FA6400] rounded-full animate-spin mx-auto mb-2"></div>
                                        <p className="text-xs text-stone-500 font-medium">Loading chat threads...</p>
                                    </div>
                                ) : filteredRooms.length === 0 ? (
                                    <div className="py-16 text-center text-stone-400 text-xs sm:text-sm">
                                        No active conversation rooms found on the platform.
                                    </div>
                                ) : (
                                    filteredRooms.map((room) => (
                                        <div
                                            key={room.id}
                                            onClick={() => handleSelectRoom(room)}
                                            className="p-4 rounded-2xl border border-stone-100 hover:border-[#FA6400]/40 hover:bg-[#FFF9F5] transition-all cursor-pointer flex items-center justify-between gap-4 group"
                                        >
                                            <div className="space-y-1 max-w-[70%]">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-stone-900 group-hover:text-[#FA6400] transition-colors">
                                                        {room.studentName || 'Student'}
                                                    </span>
                                                    <span className="text-stone-300 text-xs">↔</span>
                                                    <span className="text-xs font-bold text-stone-700">
                                                        {room.landlordName || 'Host'}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-stone-500 truncate" title={room.lastMessage}>
                                                    {room.lastMessage ? `"${room.lastMessage}"` : 'No messages exchanged yet'}
                                                </p>
                                                <div className="flex items-center gap-2 text-[10px] text-stone-400 pt-0.5">
                                                    <span>{room.totalMessages} message{room.totalMessages === 1 ? '' : 's'}</span>
                                                    {room.lastMessageAt && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="flex items-center gap-1">
                                                                <FiClock className="text-[10px]" />
                                                                {formatDate(room.lastMessageAt)}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                className="px-3 py-1.5 rounded-xl bg-stone-100 group-hover:bg-[#FA6400] group-hover:text-white text-stone-700 text-xs font-bold transition-all shrink-0"
                                            >
                                                Inspect
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Conversation Viewer Slide-Over Modal */}
            {selectedRoom && (
                <div
                    className="fixed inset-0 z-[500] flex items-center justify-end bg-black/50 backdrop-blur-xs animate-fadeIn"
                    onClick={() => setSelectedRoom(null)}
                >
                    <div
                        className="bg-white w-full max-w-lg h-full shadow-2xl overflow-y-auto p-6 sm:p-8 space-y-6 flex flex-col justify-between"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="space-y-6">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                                <div>
                                    <span className="text-[10px] font-bold tracking-wider uppercase text-[#FA6400]">
                                        Thread #{selectedRoom.id}
                                    </span>
                                    <h3 className="text-base font-bold text-stone-900 font-poppins">
                                        {selectedRoom.studentName} & {selectedRoom.landlordName}
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedRoom(null)}
                                    className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100"
                                >
                                    <IoCloseOutline className="text-2xl" />
                                </button>
                            </div>

                            {/* Participant details */}
                            <div className="grid grid-cols-2 gap-3 p-4 bg-stone-50 rounded-2xl text-xs">
                                <div>
                                    <span className="text-stone-400 block text-[10px]">Student User</span>
                                    <span className="font-bold text-stone-800">{selectedRoom.studentName || 'Student'}</span>
                                    <span className="text-stone-500 block text-[11px] truncate">{selectedRoom.studentEmail}</span>
                                </div>
                                <div>
                                    <span className="text-stone-400 block text-[10px]">Host / Landlord</span>
                                    <span className="font-bold text-stone-800">{selectedRoom.landlordName || 'Landlord'}</span>
                                    <span className="text-stone-500 block text-[11px] truncate">{selectedRoom.landlordEmail}</span>
                                </div>
                            </div>

                            {/* Messages History */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                                    Message Transcript
                                </h4>

                                {isLoadingMessages ? (
                                    <div className="py-12 text-center">
                                        <div className="w-6 h-6 border-2 border-[#FA6400]/20 border-t-[#FA6400] rounded-full animate-spin mx-auto mb-2"></div>
                                        <p className="text-xs text-stone-500 font-medium">Fetching transcript...</p>
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="p-8 text-center bg-stone-50 rounded-2xl text-xs text-stone-400">
                                        No chat messages recorded in this conversation yet.
                                    </div>
                                ) : (
                                    <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                                        {messages.map((m) => {
                                            const senderEmail = m.sender ? m.sender.email : '';
                                            const isStudent = senderEmail === selectedRoom.studentEmail;

                                            return (
                                                <div
                                                    key={m.id}
                                                    className={`p-3.5 rounded-2xl text-xs space-y-1 ${
                                                        isStudent
                                                            ? 'bg-blue-50/70 border border-blue-100 mr-8'
                                                            : 'bg-stone-50 border border-stone-200 ml-8'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between text-[10px] text-stone-500">
                                                        <span className="font-bold text-stone-700">
                                                            {isStudent ? 'Tenant' : 'Landlord'}: {senderEmail}
                                                        </span>
                                                        <span>{formatDate(m.createdAt)}</span>
                                                    </div>
                                                    <p className="text-stone-800 leading-relaxed font-medium">
                                                        {m.content}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="pt-4 border-t border-stone-100 text-center">
                            <button
                                type="button"
                                onClick={() => setSelectedRoom(null)}
                                className="w-full py-2.5 rounded-xl border border-stone-200 text-stone-700 text-xs font-bold hover:bg-stone-50"
                            >
                                Close Transcript
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminMessages;
