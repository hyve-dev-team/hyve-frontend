const ChatBubble = ({ message, isSender }) => {

    // Base classes for the bubble shape and text
    const baseClasses = "max-w-[80%] sm:max-w-[80%] md:max-w-[60%] lg:max-w-[40%] py-3 px-3 sm:px-4 relative";

    // Receiver (Tenant's message) 
    const receiverClasses = "bg-[#FFF8F1] mr-auto shadow-sm rounded-[10px_10px_10px_0] md:rounded-[12px_12px_12px_0]" ;

    // Sender (User's message)
    const senderClasses = "bg-primary text-white ml-auto shadow-md rounded-[10px_10px_0px_10px] md:rounded-[12px_12px_0px_12px]";

    return (
        <div className={`flex w-full ${isSender ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`${baseClasses} ${isSender ? senderClasses : receiverClasses}`}>
                <p className="text-xs leading-snug break-words sm:text-sm">{message}</p>
            </div>
        </div>
    );
};
export default ChatBubble