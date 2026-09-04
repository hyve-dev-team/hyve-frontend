import { Link } from 'react-router-dom'

const Navitem = (props) => {
    const { to, label, onClick, isActive, className = '' } = props;
    const Icon = props.icon;
    return (
        <Link to={to} onClick={onClick} className="block group">
            <li
                className={`flex items-center gap-3 px-3.5 lg:px-4 py-2.5 lg:py-3 rounded-xl transition-all duration-200 relative ${
                    isActive
                        ? 'bg-primary text-white shadow-sm shadow-primary/25 font-medium'
                        : 'text-[#3D3129]/75 hover:bg-white/70 hover:text-primary font-normal'
                }`}
            >
                <Icon
                    className={`text-[18px] lg:text-[20px] transition-transform duration-200 ${
                        isActive
                            ? 'text-white'
                            : 'text-primary/70 group-hover:text-primary group-hover:scale-110'
                    } ${className}`}
                />
                <p className='text-sm leading-none'>{label}</p>
                {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                )}
            </li>
        </Link>
    )
}

export default Navitem