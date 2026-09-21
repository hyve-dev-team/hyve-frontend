import { Link, useLocation } from 'react-router-dom';
import hyveLogoWhite from '../../assets/svg/logo/hyve-logo-white.svg';
import { HiHome, HiUsers } from 'react-icons/hi2';
import { BsBuildingsFill } from 'react-icons/bs';
import { MdPayment, MdMessage } from 'react-icons/md';

const AdminSidebar = () => {
    const location = useLocation();
    const currentPath = location.pathname;

    const navItems = [
        {
            name: 'Dashboard',
            path: '/admin/dashboard',
            icon: <HiHome className="text-xl" />
        },
        {
            name: 'User Management',
            path: '/admin/users',
            icon: <HiUsers className="text-xl" />
        },
        {
            name: 'Property Management',
            path: '/admin/properties',
            icon: <BsBuildingsFill className="text-lg" />
        },
        {
            name: 'Payments & Transactions',
            path: '/admin/transactions',
            icon: <MdPayment className="text-xl" />
        },
        {
            name: 'Messages',
            path: '/admin/messages',
            icon: <MdMessage className="text-xl" />
        }
    ];

    return (
        <aside className="w-64 lg:w-72 bg-[#FA6400] text-white shrink-0 sticky top-0 h-screen h-[100svh] overflow-y-auto [&::-webkit-scrollbar]:hidden flex flex-col justify-between py-8 px-6 selection:bg-white/20 z-30">
            <div>
                {/* Brand Logo */}
                <div className="flex items-center gap-3 mb-12 pl-2">
                    <img src={hyveLogoWhite} alt="Hyve Logo" className="w-9 h-9 object-contain" />
                    <span className="font-extrabold text-2xl tracking-wider font-poppins text-white">
                        HYVE
                    </span>
                </div>

                {/* Nav links */}
                <nav className="space-y-3">
                    {navItems.map((item) => {
                        const isActive = currentPath === item.path || (item.path === '/admin/dashboard' && currentPath === '/admin');
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex items-center gap-3.5 px-5 py-3 rounded-full text-sm font-semibold transition-all duration-200 ${
                                    isActive
                                        ? 'bg-white text-[#FA6400] shadow-[0_4px_14px_rgba(0,0,0,0.08)]'
                                        : 'text-white hover:bg-white/15'
                                }`}
                            >
                                <span className={isActive ? 'text-[#FA6400]' : 'text-white'}>
                                    {item.icon}
                                </span>
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom info or copyright */}
            <div className="pl-2 text-xs text-white/70">
                <p className="font-medium text-white/90">Hyve Haven Admin</p>
                <p className="text-[11px] mt-0.5">Control Center v1.2</p>
            </div>
        </aside>
    );
};

export default AdminSidebar;
