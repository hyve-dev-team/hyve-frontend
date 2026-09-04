import { RiArrowRightSLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';

const ProfileOption = ({ icon: Icon, to, title, subtitle, badge, badgeClass }) => {
    return (
        <Link to={to} className='group block w-full outline-none'>
            <div className='flex items-center justify-between p-4 sm:p-4.5 bg-white border border-stone-200/90 hover:border-primary/50 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md transition-all duration-200'>
                <div className='flex items-center gap-3.5 sm:gap-4 min-w-0'>
                    <div className='w-11 h-11 rounded-xl bg-orange-50 text-primary flex items-center justify-center text-xl group-hover:scale-105 group-hover:bg-primary group-hover:text-white transition-all duration-200 flex-shrink-0'>
                        <Icon />
                    </div>
                    <div className='min-w-0'>
                        <h4 className='text-sm font-semibold text-stone-900 group-hover:text-primary transition-colors font-poppins truncate'>
                            {title}
                        </h4>
                        {subtitle && (
                            <p className='text-xs text-stone-500 font-normal mt-0.5 truncate'>
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>

                <div className='flex items-center gap-2.5 flex-shrink-0 ml-3'>
                    {badge && (
                        <span
                            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                                badgeClass || 'bg-orange-50 text-primary border border-orange-200/70'
                            }`}
                        >
                            {badge}
                        </span>
                    )}
                    <div className='w-8 h-8 rounded-full flex items-center justify-center text-stone-400 group-hover:text-primary group-hover:bg-orange-50 transition-all duration-200'>
                        <RiArrowRightSLine className='text-xl group-hover:translate-x-0.5 transition-transform' />
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ProfileOption;