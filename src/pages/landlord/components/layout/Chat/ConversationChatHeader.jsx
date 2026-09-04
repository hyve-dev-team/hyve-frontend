import { IoCall, IoArrowBack } from "react-icons/io5";
import { Link } from "react-router-dom";
import defaultProfileImage from "../../../../../assets/images/shared-images/user-1.png";

const ConversationChatHeader = ({ contact }) => {
    const avatar = contact?.avatarSrc || defaultProfileImage;
    const name = contact?.name || "Chat";
    const phone = contact?.phone || "";
    const isOnline = Boolean(contact?.isOnline);

    return (
        <header className="sticky top-0 z-20 flex items-center justify-between px-3 py-3 bg-white border-b sm:px-6 lg:px-8 border-[#0000000D] shadow-sm">
            <div className='flex items-center justify-between w-full'>
                <div className="flex items-center space-x-2.5 sm:space-x-3.5 min-w-0">
                    {/* Back Button */}
                    <Link
                        to="/landlord/chats"
                        className="p-1.5 -ml-1 text-[#3D3129]/70 hover:text-primary hover:bg-black/5 rounded-full transition-colors"
                        title="Back to all chats"
                    >
                        <IoArrowBack className="text-xl" />
                    </Link>

                    {/* Avatar with status dot */}
                    <div className="relative flex-shrink-0 w-9 h-9 sm:w-11 sm:h-11 overflow-hidden rounded-full border border-black/10 bg-primary/10 flex items-center justify-center">
                        {contact?.avatarSrc ? (
                            <img
                                src={avatar}
                                alt={name}
                                className="object-cover w-full h-full"
                                onError={(e) => { e.target.src = defaultProfileImage; }}
                            />
                        ) : (
                            <span className="font-bold text-sm text-primary">
                                {name.charAt(0).toUpperCase()}
                            </span>
                        )}
                        {isOnline && (
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                        )}
                    </div>

                    {/* Contact Details */}
                    <div className="min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base leading-tight font-poppins text-[#3D3129] truncate">
                            {name}
                        </h3>
                        <p className="text-[11px] font-normal text-[#888888] truncate mt-0.5">
                            {isOnline ? (
                                <span className="text-green-600 font-medium">● Online</span>
                            ) : phone ? (
                                phone
                            ) : (
                                "Prospective Tenant"
                            )}
                        </p>
                    </div>
                </div>

                {/* Call Action Button */}
                {phone && (
                    <div className="pr-1 flex-shrink-0">
                        <a
                            href={`tel:${phone}`}
                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#FFF0E6] text-primary hover:bg-primary hover:text-white flex items-center justify-center transition-colors shadow-sm"
                            title={`Call ${name}`}
                        >
                            <IoCall className="text-base sm:text-lg" />
                        </a>
                    </div>
                )}
            </div>
        </header>
    );
};

export default ConversationChatHeader;