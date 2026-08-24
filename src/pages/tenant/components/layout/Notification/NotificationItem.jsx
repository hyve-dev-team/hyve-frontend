
const NotificationItem = ({ title, date, read = false, onClick }) => {

    return (
        <button
            type="button"
            onClick={onClick}
            className="flex items-start w-full py-4 text-left transition-colors rounded-md hover:bg-[#FFF6F0] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary px-2 -mx-2"
        >
            {/* Unread indicator dot */}
            <span
                aria-hidden="true"
                className={`mt-1.5 mr-3 h-2 w-2 flex-shrink-0 rounded-full ${read ? "bg-transparent" : "bg-primary"}`}
            />

            <div className="flex-1">
                {/* Title/Description */}
                <p className={`text-xs md:text-sm ${read ? "font-normal text-[#AAAAAA]" : "font-medium text-[#333333]"}`}>
                    {title}
                </p>

                {/* Date */}
                <p className="mt-2 text-xs text-[#717171] font-normal">
                    {date}
                </p>
            </div>
        </button>
    );
};

export default NotificationItem;
