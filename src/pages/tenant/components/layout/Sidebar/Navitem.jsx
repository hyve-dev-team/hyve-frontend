import { Link } from 'react-router-dom'

const Navitem = ({icon:Icon, to, label, onClick, isActive, className}) => {
    return (
        <Link to={to} onClick={onClick}>
            <li className={`flex items-center gap-3 px-4 lg:px-6 py-3 lg:py-4 rounded-md text-[#3D3129]/70 smooth-transition ${isActive ? 'bg-[#FF6300]/10' : 'bg-transparent'}`}>
                <Icon className={`${className} text-[16px] lg:text-[20px] smooth-transition ${isActive ? 'text-primary' : 'text-[#FFB88B]'}`} />
                <p className={`text-sm smooth-transition ${isActive  ? 'font-medium text-primary' : 'font-normal'}`}>{label}</p>
            </li>
        </Link>
    )
}

export default Navitem