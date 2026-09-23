const NotificationItem = ({ title, date, type, read = false, onClick }) => {
    const getBadge = (t = "") => {
        const typeStr = (t || "").toUpperCase();
        if (typeStr.includes("ESCROW") || typeStr.includes("PAYMENT")) {
            return <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 mr-2 mb-1">💰 Rent Paid (Escrow)</span>;
        }
        if (typeStr.includes("TOUR") || typeStr.includes("INSPECTION")) {
            return <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 mr-2 mb-1">👀 Inspection / Viewing</span>;
        }
        if (typeStr.includes("MOVE_IN") || typeStr.includes("MOVE")) {
            return <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-primary border border-primary/20 mr-2 mb-1">🏠 Tenant Move-In</span>;
        }
        if (typeStr.includes("QUEUE")) {
            return <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 mr-2 mb-1">👥 Queue Update</span>;
        }
        if (typeStr.includes("CHAT") || typeStr.includes("MESSAGE")) {
            return <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 mr-2 mb-1">💬 Message</span>;
        }
        return null;
    };

    return (
        <button
            type="button"
            onClick={onClick}
            className="flex items-start w-full py-4 text-left transition-colors rounded-xl hover:bg-[#FFF6F0] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary px-3 -mx-1 cursor-pointer"
        >
            {/* Unread indicator dot */}
            <span
                aria-hidden="true"
                className={`mt-2 mr-3 h-2.5 w-2.5 flex-shrink-0 rounded-full ${read ? "bg-transparent border border-gray-200" : "bg-primary shadow-xs ring-2 ring-primary/20"}`}
            />

            <div className="flex-1">
                {/* Category Badge if applicable */}
                {type && getBadge(type)}

                {/* Title/Description */}
                <p className={`text-xs md:text-sm leading-relaxed ${read ? "font-normal text-[#6B7280]" : "font-semibold text-[#1F2937]"}`}>
                    {title}
                </p>

                {/* Date */}
                <p className="mt-1.5 text-[11px] text-[#9CA3AF] font-normal">
                    {date}
                </p>
            </div>
        </button>
    );
};

export default NotificationItem;