import { Link } from 'react-router-dom'

const SocialIcons = ({ icon, dynamicClasses }) => {
    return (
        <Link className={`border border-black/80 rounded-full p-1 hover:text-primary hover:border-primary smooth-transition ${dynamicClasses} text-[14px] md:text-[18px]`}>
            {icon}
        </Link>
    )
}

export default SocialIcons