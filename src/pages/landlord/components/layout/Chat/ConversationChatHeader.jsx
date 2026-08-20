import { IoCall } from "react-icons/io5";
import { Link } from "react-router-dom";

const ConversationChatHeader = ({ contact }) => {
    return (
        <header className="sticky top-0 z-20 flex items-center justify-between px-3 pt-4 pb-3 bg-white border-b sm:flex-col sm:pt-4 sm:pb-3 sm:px-6 lg:px-8 lg:flex-row border-[#0000000D]">
            <div className='flex items-center justify-between w-full'>
                <div className="flex items-center space-x-2 md:space-x-3">
                    {/* Avatar and Name */}
                    <div className="relative w-10 h-10 overflow-hidden rounded-full md:w-14 md:h-14">
                        <img
                            src={contact.avatarSrc}
                            alt={`profile image`}
                            className="object-cover w-full h-full"
                        />
                    </div>

                    {/* Contact Details */}
                    <div>
                        <h3 className="font-bold text-sm md:text-[18px] leading-none font-poppins">{contact.name}</h3>
                        <p className="mt-1 text-xs font-normal text-[#AAAAAA]">{contact.phone}</p>
                    </div>

                </div>
                <div className="pr-2">
                    <a href="tel:08123456789" className="text-primary hover:text-primary-hover">
                        <button aria-label="Call" className="text-xl"><IoCall className="text-[18px] md:text-[20px]"/></button>
                    </a>
                </div>
            </div>
        </header>
    )
}

export default ConversationChatHeader