import { Link } from 'react-router-dom';
import { IoStarSharp, IoHomeOutline } from 'react-icons/io5';
import placeholderImage from '../../../../../assets/images/apartments/apartment-image-1.png';

const AllProperties = ({ properties = [], isLoading = false, error = null, onRetry }) => {
    return (
        <section className='mt-6 md:mt-8'>
            <div className='flex items-center justify-between mb-4'>
                <h3 className='font-poppins text-lg font-semibold text-[#3D3129]'>
                    Your Properties
                </h3>
                {!isLoading && properties.length > 0 && (
                    <span className='text-xs font-medium text-[#3D3129]/60 font-poppins'>
                        {properties.length} {properties.length === 1 ? 'listing' : 'listings'}
                    </span>
                )}
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-1 md:gap-6 lg:grid-cols-2">
                    {[1, 2].map((n) => (
                        <div key={n} className='border border-black/10 rounded-[16px] p-3 md:p-4 bg-white shadow-sm animate-pulse'>
                            <div className="w-full h-[260px] sm:h-[280px] bg-black/5 rounded-[12px] mb-4" />
                            <div className="h-5 bg-black/5 rounded w-3/4 mb-2" />
                            <div className="h-4 bg-black/5 rounded w-1/3 mb-4" />
                            <div className="flex gap-4 mt-4">
                                <div className="h-9 bg-black/5 rounded-lg w-1/2" />
                                <div className="h-9 bg-black/5 rounded-lg w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Error State */}
            {!isLoading && error && (
                <div className='p-6 rounded-2xl border border-red-200 bg-red-50/50 text-center my-4'>
                    <p className='text-sm text-red-600 font-medium mb-3'>{error}</p>
                    {onRetry && (
                        <button
                            type='button'
                            onClick={onRetry}
                            className='px-4 py-2 text-xs font-medium text-white bg-primary hover:bg-primary-hover rounded-lg shadow smooth-transition'
                        >
                            Retry
                        </button>
                    )}
                </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && properties.length === 0 && (
                <div className="py-14 px-6 text-center border-2 border-dashed border-[#FF6300]/25 rounded-2xl bg-[#FFF0E6]/30 flex flex-col items-center justify-center my-2">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3 text-2xl">
                        <IoHomeOutline />
                    </div>
                    <h3 className="font-poppins text-lg font-semibold text-[#3D3129]">
                        No properties listed yet
                    </h3>
                    <p className="text-sm text-[#3D3129]/60 max-w-sm mt-1 mb-5">
                        Upload your first property to start receiving user inquiries, scheduling visits, and tracking reviews.
                    </p>
                    <Link
                        to="/landlord/property/add"
                        className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-xl shadow-md smooth-transition flex items-center gap-2"
                    >
                        <span>Add Property</span>
                    </Link>
                </div>
            )}

            {/* Populated Properties Grid */}
            {!isLoading && !error && properties.length > 0 && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-1 md:gap-6 lg:grid-cols-2">
                    {properties.map((lodge) => (
                        <div key={lodge.id} className='border border-[#FF630033] rounded-[16px] p-3 md:p-4 bg-white shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-200'>
                            <div>
                                {/* lodge image */}
                                <div className="rounded-[12px] relative overflow-hidden w-full h-[260px] sm:h-[280px]">
                                    <Link to={`/landlord/property/${lodge.id}/manage`}>
                                        <img
                                            src={lodge.lodgeImage || placeholderImage}
                                            alt={lodge.lodgeDesc}
                                            className='object-cover w-full h-full hover:scale-105 transition-transform duration-300'
                                            onError={(e) => { e.target.src = placeholderImage; }}
                                        />
                                    </Link>
                                    {/* Status Badge */}
                                    <span className={`absolute top-3 right-3 text-[11px] px-3 py-1 rounded-full font-medium shadow-sm ${
                                        lodge.status === 'open' || lodge.status === 'ACTIVE'
                                            ? 'bg-[#DDFFE7] text-[#1B784D]'
                                            : 'bg-black/60 text-white'
                                    }`}>
                                        {lodge.status === 'open' || lodge.status === 'ACTIVE' ? 'Available' : 'Filled'}
                                    </span>
                                </div>

                                {/* lodge details */}
                                <div className="mt-3">
                                    <div className="flex items-start justify-between gap-3 mb-1">
                                        <Link to={`/landlord/property/${lodge.id}/manage`} className="flex-1 min-w-0">
                                            <h3 className="font-poppins text-[15px] md:text-[16px] font-semibold text-[#3D3129] line-clamp-2 hover:text-primary transition-colors">
                                                {lodge.lodgeDesc}
                                            </h3>
                                        </Link>
                                        <div className="flex-shrink-0 text-right">
                                            <p className="text-sm font-semibold text-primary md:text-[16px] whitespace-nowrap">
                                                ₦ {Number(lodge.price || 0).toLocaleString()}
                                            </p>
                                            <p className="text-[10px] md:text-[11px] font-light capitalize text-[#888888]">
                                                per month
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* location & rating */}
                                <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
                                    <p className="text-[12px] md:text-sm text-[#888888]">
                                        {lodge.nearbyDistance || "Location on inquiry"}
                                    </p>

                                    <div className="flex items-center gap-1.5">
                                        <IoStarSharp className="text-[#F6D100] text-[18px]" />
                                        <span className="text-xs font-bold text-[#3D3129]">
                                            {lodge.starRating}
                                        </span>
                                        <span className="text-[11px] font-light text-[#888888]">
                                            ({lodge.totalReviews || 0} reviews)
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* CTA Actions */}
                            <div className="flex gap-3 mt-5 pt-3 border-t border-black/5">
                                <Link
                                    to={`/landlord/property/${lodge.id}/manage`}
                                    className='w-1/2 py-2.5 text-white rounded-xl shadow-sm bg-primary hover:bg-primary-hover smooth-transition text-xs sm:text-sm text-center font-medium'
                                >
                                    Manage Property
                                </Link>

                                <Link
                                    to={`/landlord/property/${lodge.id}/reviews`}
                                    className="w-1/2 py-2.5 text-[#3D3129] bg-transparent border border-primary/40 rounded-xl shadow-sm hover:bg-[#FFF0E6] smooth-transition text-xs sm:text-sm text-center font-medium"
                                >
                                    Check Reviews
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
};

export default AllProperties;