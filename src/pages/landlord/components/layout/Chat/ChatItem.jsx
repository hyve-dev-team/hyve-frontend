import defaultProfileImage from '../../../../../assets/images/shared-images/user-1.png';

const ChatItem = ({ avatarSrc, name, lastMessage, timestamp, isOnline }) => {
    const displayName = name?.trim() || "User";

    return (
        <div className="flex items-center py-3.5 px-2 rounded-xl cursor-pointer hover:bg-[#FFF0E6]/50 transition-colors duration-150">
            {/* Avatar Section */}
            <div className="relative flex-shrink-0 w-11 h-11 md:w-12 md:h-12">
                {avatarSrc ? (
                    <img
                        src={avatarSrc}
                        alt={displayName}
                        className="object-cover w-full h-full rounded-full border border-black/10"
                        onError={(e) => { e.target.src = defaultProfileImage; }}
                    />
                ) : (
                    <div className="flex items-center justify-center w-full h-full text-base font-bold text-white rounded-full bg-primary shadow-sm">
                        {displayName.charAt(0).toUpperCase()}
                    </div>
                )}

                {/* Online Status Dot */}
                {isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                )}
            </div>

            {/* Chat Details Section */}
            <div className="flex-1 ml-3 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-xs md:text-sm font-semibold text-[#3D3129] font-poppins truncate">
                        {displayName}
                    </p>
                    {timestamp && (
                        <span className="flex-shrink-0 text-[11px] text-[#888888]">
                            {timestamp}
                        </span>
                    )}
                </div>
                <p className="text-xs text-[#888888] truncate mt-0.5">
                    {lastMessage || "Click to view message"}
                </p>
            </div>
        </div>
    );
};

export default ChatItem;