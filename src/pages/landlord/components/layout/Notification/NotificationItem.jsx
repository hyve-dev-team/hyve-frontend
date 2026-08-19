const NotificationItem = ({ title, date }) => {

    return (
        <div className="flex items-start py-4 ">
            <div className="flex-1">
                {/* Title/Description */}
                <p className="text-xs md:text-sm font-normal md:font-medium text-[#717171]">
                    {title}
                </p>

                {/* Date */}
                <p className="mt-2 text-xs text-[#717171] font-normal">
                    {date}
                </p>
            </div>
        </div>
    );
};

export default NotificationItem;