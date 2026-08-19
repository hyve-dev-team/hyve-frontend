import React from 'react'

const ChatItem = ({ avatarSrc, name, lastMessage, timestamp, unreadDot, isOnline }) => {
    return (

        <div className="flex items-center py-4 cursor-pointer md:px-2 hover:bg-primary-light/30 smooth-transition">
            {/* Avatar Section */}
            <div className="relative flex-shrink-0 w-10 h-10 md:w-12 md:h-12">
                {avatarSrc ? (
                    <img
                        src={avatarSrc}
                        alt={`profile image`}
                        className="object-cover w-full h-full rounded-full"
                    />
                ) : (
                    // Fallback for icons or initials if avatarSrc is not provided
                    <div
                        className="flex items-center justify-center w-full h-full text-lg font-bold text-white rounded-full bg-primary"
                    >
                        {name.charAt(0).toUpperCase()}
                    </div>
                )}

                {/* Online Status Dot */}
                {/* {isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
                )} */}
            </div>

            {/* Chat Details Section */}
            <div className="flex-1 ml-2 overflow-hidden md:ml-3">
                <div className="flex items-center justify-between">
                    <p className="pr-2 text-xs font-medium truncate md:text-sm">
                        {name} 
                    </p>
                    <span className="flex-shrink-0 text-xs text-black/70">
                        {timestamp}
                    </span>
                </div>
                <p className="text-xs truncate text-[#AAAAAA] mt-0.5 max-w-[80%] md:max-w-full">
                    {lastMessage}
                </p>
            </div>
        </div>
    )
}

export default ChatItem