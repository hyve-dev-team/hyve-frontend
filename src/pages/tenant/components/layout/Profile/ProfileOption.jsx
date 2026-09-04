import { RiArrowRightSLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';

const ProfileOption = ({ icon: Icon, to, title }) => {
    return (
        <Link to={to} className='relative w-full'>
            <div className='px-4 py-3 rounded-lg bg-primary-light'>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2 text-[#3D3129]/70'>
                        <Icon />
                        <p className='text-sm text-normal'>{title}</p>
                    </div>
                    <div className='text-[#3D3129]/70'>
                        <RiArrowRightSLine />
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ProfileOption;