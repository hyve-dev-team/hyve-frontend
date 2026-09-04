const ChatBubble = ({ message, isSender, timestamp }) => {
    // Base classes for the bubble shape and text
    const baseClasses = "max-w-[85%] sm:max-w-[75%] md:max-w-[60%] lg:max-w-[45%] py-2.5 px-3.5 sm:px-4 relative";

    // Receiver (Tenant's message) 
    const receiverClasses = "bg-[#FAF7F5] text-[#3D3129] border border-black/5 mr-auto shadow-sm rounded-2xl rounded-bl-sm";

    // Sender (Landlord's message)
    const senderClasses = "bg-primary text-white ml-auto shadow-sm rounded-2xl rounded-br-sm";

    const formattedTime = timestamp
        ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : null;

    return (
        <div className={`flex w-full ${isSender ? 'justify-end' : 'justify-start'} mb-3`}>
            <div className={`${baseClasses} ${isSender ? senderClasses : receiverClasses}`}>
                <p className="text-xs sm:text-sm leading-relaxed break-words whitespace-pre-wrap">{message}</p>
                {formattedTime && (
                    <span className={`block text-[10px] mt-1 text-right ${isSender ? 'text-white/75' : 'text-[#888888]'}`}>
                        {formattedTime}
                    </span>
                )}
            </div>
        </div>
    );
};

export default ChatBubble;