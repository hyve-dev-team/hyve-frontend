import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar/Sidebar';
import Header from './components/layout/Dashboard/Header';
import MobileNavigationTab from './components/layout/MobileNavigation/MobileNavigationTab';
import { getLandlordPropertyById, updateLandlordProperty } from '../../utils/landlordPropertiesApi';
import { getPropertyById } from '../../utils/propertiesApi';
import { uploadMediaFiles } from '../../utils/mediaApi';
import { hyveSuccess, hyveError } from '../../utils/hyveToast';

import {
    IoHomeOutline,
    IoLocationOutline,
    IoPricetagOutline,
    IoCloudUploadOutline,
    IoCloseCircle,
    IoCheckmarkCircle,
    IoArrowBack,
    IoAdd,
    IoTimeOutline,
    IoSaveOutline
} from 'react-icons/io5';
import { BiErrorCircle } from 'react-icons/bi';
import { Loader2 } from 'lucide-react';

const PROPERTY_TYPES = [
    { value: 'APARTMENT', label: 'Apartment', desc: 'Flat or multiple rooms' },
    { value: 'STUDIO', label: 'Self-Contain / Studio', desc: 'Private room with bath & kitchen' },
    { value: 'ROOM', label: 'Single Room', desc: 'Private room with shared bath' },
    { value: 'HOUSE', label: 'Entire House', desc: 'Full building / duplex' },
];

const POPULAR_AMENITIES = [
    'Running Water',
    '24/7 Power / Generator',
    'Pre-paid Meter',
    'Security / Gated',
    'WiFi Internet',
    'Air Conditioning',
    'Kitchen Cabinets',
    'Wardrobe',
    'Parking Space',
    'Furnished',
    'Balcony',
    'Tiled Floor',
];

const MAX_IMAGES = 6;

const UpdateProperty = () => {
    const { apartmentID } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // Initial loading state
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [pageError, setPageError] = useState(null);

    // Form inputs state
    const [formData, setFormData] = useState({
        title: '',
        priceAnnually: '',
        location: '',
        propertyType: 'APARTMENT',
        minimumRentalPeriod: 12,
        description: '',
    });

    // Amenities state
    const [selectedAmenities, setSelectedAmenities] = useState([]);
    const [customAmenity, setCustomAmenity] = useState('');

    // Images state: array of { file: File | null, preview: string, isExisting: boolean }
    const [images, setImages] = useState([]);

    // Validation & submitting states
    const [validationErrors, setValidationErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch existing property details on mount
    const fetchExistingDetails = async () => {
        if (!apartmentID) {
            setPageError('No property ID provided.');
            setIsPageLoading(false);
            return;
        }

        setIsPageLoading(true);
        setPageError(null);

        try {
            let data = null;
            try {
                data = await getLandlordPropertyById(apartmentID);
            } catch (landlordErr) {
                console.warn('Landlord endpoint returned error, trying fallback user endpoint:', landlordErr);
                try {
                    data = await getPropertyById(apartmentID);
                } catch {
                    throw landlordErr;
                }
            }

            if (!data) {
                throw new Error('Property details could not be found.');
            }

            // Pre-populate form data
            const annualPrice = data.priceAnnually != null
                ? data.priceAnnually
                : (data.priceMonthly ? data.priceMonthly * 12 : '');

            setFormData({
                title: data.title || '',
                priceAnnually: annualPrice ? String(Math.round(annualPrice)) : '',
                location: data.location || '',
                propertyType: data.propertyType || 'APARTMENT',
                minimumRentalPeriod: data.minimumRentalPeriod || 12,
                description: data.description || '',
            });

            setSelectedAmenities(data.amenities || []);

            // Populate existing images
            const existingImgs = (data.images || []).map((url) => ({
                file: null,
                preview: url,
                isExisting: true,
            }));
            setImages(existingImgs);
        } catch (err) {
            console.error('Error loading property for edit:', err);
            setPageError(err?.message || 'Failed to load property details. Please try again.');
        } finally {
            setIsPageLoading(false);
        }
    };

    useEffect(() => {
        fetchExistingDetails();
    }, [apartmentID]);

    // Handle text change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (validationErrors[name]) {
            setValidationErrors((prev) => {
                const updated = { ...prev };
                delete updated[name];
                return updated;
            });
        }
    };

    // Toggle amenity selection
    const toggleAmenity = (amenity) => {
        setSelectedAmenities((prev) =>
            prev.includes(amenity)
                ? prev.filter((a) => a !== amenity)
                : [...prev, amenity]
        );
    };

    // Add custom amenity
    const handleAddCustomAmenity = (e) => {
        if (e) e.preventDefault();
        const trimmed = customAmenity.trim();
        if (!trimmed) return;
        if (!selectedAmenities.includes(trimmed)) {
            setSelectedAmenities((prev) => [...prev, trimmed]);
        }
        setCustomAmenity('');
    };

    // Handle selecting new files from input
    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const availableSlots = MAX_IMAGES - images.length;
        const toAdd = files.slice(0, availableSlots).map((file) => ({
            file,
            preview: URL.createObjectURL(file),
            isExisting: false,
        }));

        setImages((prev) => [...prev, ...toAdd]);

        if (validationErrors.images) {
            setValidationErrors((prev) => {
                const updated = { ...prev };
                delete updated.images;
                return updated;
            });
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Remove an image (existing or new)
    const handleRemoveImage = (indexToRemove) => {
        setImages((prev) => {
            const item = prev[indexToRemove];
            if (item?.file && item?.preview) {
                URL.revokeObjectURL(item.preview);
            }
            return prev.filter((_, idx) => idx !== indexToRemove);
        });
    };

    // Form validation
    const validate = () => {
        const errors = {};
        if (!formData.title.trim()) {
            errors.title = 'Property title is required';
        }
        if (!formData.priceAnnually || Number(formData.priceAnnually) <= 0) {
            errors.priceAnnually = 'Please provide a valid annual rent price';
        }
        if (!formData.location.trim()) {
            errors.location = 'Property address / location is required';
        }
        if (images.length === 0) {
            errors.images = 'Please upload or keep at least 1 photo';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Submit changes
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
            hyveError('Incomplete form', 'Please check highlighted fields before saving.');
            return;
        }

        setIsSubmitting(true);

        try {
            // 1. Separate existing image URLs vs new File uploads
            const existingUrls = images
                .filter((img) => img.isExisting || !img.file)
                .map((img) => img.preview);

            const newFiles = images
                .filter((img) => img.file)
                .map((img) => img.file);

            let uploadedUrls = [];
            if (newFiles.length > 0) {
                uploadedUrls = await uploadMediaFiles(newFiles, 'properties');
            }

            const finalImages = [...existingUrls, ...uploadedUrls];

            // 2. Build update payload
            const payload = {
                title: formData.title.trim(),
                description: formData.description.trim() || `${formData.propertyType} located at ${formData.location.trim()}`,
                priceAnnually: Number(formData.priceAnnually),
                location: formData.location.trim(),
                propertyType: formData.propertyType,
                amenities: selectedAmenities,
                images: finalImages,
                minimumRentalPeriod: Number(formData.minimumRentalPeriod) || 12,
            };

            await updateLandlordProperty(apartmentID, payload);

            hyveSuccess('Property updated!', 'Your changes have been saved successfully.');
            navigate(`/landlord/property/${apartmentID}/manage`);
        } catch (err) {
            console.error('Failed to update property:', err);
            const msg = err?.message || 'Could not update property. Please try again.';
            hyveError('Update failed', msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const monthlyPriceEstimate = formData.priceAnnually && Number(formData.priceAnnually) > 0
        ? Math.round(Number(formData.priceAnnually) / 12)
        : null;

    return (
        <div className='page-wrapper'>
            <div className='flex'>
                {/* Sidebar */}
                <Sidebar currentPage='home' />

                {/* Main Content Area */}
                <main className='w-full h-[100svh] sm:w-[70%] lg:w-[80%] overflow-auto bg-[#FAF7F5]/50'>
                    {/* Header */}
                    <Header />

                    {isPageLoading ? (
                        <div className='flex flex-col items-center justify-center h-[calc(100vh-80px)]'>
                            <div className='spinner w-[34px] h-[34px]'></div>
                            <p className='mt-4 text-sm text-[#888888] font-poppins'>Loading property details...</p>
                        </div>
                    ) : pageError ? (
                        <div className='flex flex-col items-center justify-center h-[calc(100vh-80px)] px-4'>
                            <div className='p-8 max-w-md w-full bg-red-50/60 border border-red-200 rounded-2xl text-center'>
                                <BiErrorCircle className='text-[38px] text-primary mx-auto mb-3' />
                                <h4 className='font-poppins font-semibold text-[#3D3129] text-base mb-1'>
                                    Unable to Load Property Details
                                </h4>
                                <p className='text-xs text-red-600 mb-5'>{pageError}</p>
                                <div className='flex items-center justify-center gap-3'>
                                    <button
                                        type='button'
                                        onClick={fetchExistingDetails}
                                        className='px-4 py-2 text-xs font-medium text-white bg-primary hover:bg-primary-hover rounded-xl shadow smooth-transition'
                                    >
                                        Retry
                                    </button>
                                    <Link
                                        to={`/landlord/property/${apartmentID}/manage`}
                                        className='px-4 py-2 text-xs font-medium text-[#3D3129] border border-black/15 hover:bg-black/5 rounded-xl smooth-transition'
                                    >
                                        Back to Details
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className='px-4 sm:px-8 py-8 pb-28 max-w-6xl mx-auto'>
                            {/* Top navigation breadcrumb & title */}
                            <div className='flex flex-wrap items-center justify-between gap-4 mb-8'>
                                <div>
                                    <Link
                                        to={`/landlord/property/${apartmentID}/manage`}
                                        className='inline-flex items-center gap-1.5 text-xs text-[#3D3129]/60 hover:text-primary transition-colors mb-2 font-medium'
                                    >
                                        <IoArrowBack /> Back to Property Management
                                    </Link>
                                    <h1 className='text-2xl lg:text-3xl font-bold text-[#3D3129] font-poppins'>
                                        Edit Property Details
                                    </h1>
                                    <p className='text-xs sm:text-sm text-[#3D3129]/60 mt-1'>
                                        Update information, rent pricing, amenities, or photos for listing #{apartmentID}.
                                    </p>
                                </div>

                                <div className='flex items-center gap-3'>
                                    <Link
                                        to={`/landlord/property/${apartmentID}/manage`}
                                        className='px-4 py-2.5 rounded-xl border border-[#3D3129]/20 text-xs sm:text-sm font-medium text-[#3D3129] hover:bg-white transition-colors'
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        type='button'
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className='px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-medium shadow-md shadow-primary/20 flex items-center gap-2 smooth-transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer'
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className='w-4 h-4 animate-spin text-white' />
                                                <span>Saving Changes...</span>
                                            </>
                                        ) : (
                                            <>
                                                <IoSaveOutline className='text-base' />
                                                <span>Save Changes</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Form Layout */}
                            <form onSubmit={handleSubmit} className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                                {/* Left 2 Columns: Core Form Details */}
                                <div className='lg:col-span-2 space-y-6'>
                                    {/* Section 1: Basic Information */}
                                    <div className='bg-white rounded-2xl p-5 sm:p-7 border border-[#FF6300]/15 shadow-sm'>
                                        <div className='flex items-center gap-2 mb-4'>
                                            <div className='w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-lg'>
                                                <IoHomeOutline />
                                            </div>
                                            <div>
                                                <h2 className='text-base font-semibold text-[#3D3129] font-poppins'>
                                                    Property Overview
                                                </h2>
                                                <p className='text-xs text-[#3D3129]/60'>
                                                    Title and accommodation category
                                                </p>
                                            </div>
                                        </div>

                                        {/* Property Title */}
                                        <div className='mb-5'>
                                            <label htmlFor='title' className='block text-xs font-semibold text-[#3D3129] uppercase tracking-wider mb-2 font-poppins'>
                                                Property Title <span className='text-red-500'>*</span>
                                            </label>
                                            <input
                                                type='text'
                                                id='title'
                                                name='title'
                                                value={formData.title}
                                                onChange={handleChange}
                                                placeholder='e.g., Luxury Studio Apartment near Unilag Gate'
                                                className={`w-full px-4 py-3 rounded-xl text-sm border bg-[#FAF7F5]/50 focus:bg-white outline-none smooth-transition ${
                                                    validationErrors.title
                                                        ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                                                        : 'border-[#3D3129]/15 focus:border-primary'
                                                }`}
                                            />
                                            {validationErrors.title && (
                                                <p className='text-xs text-red-500 mt-1.5'>{validationErrors.title}</p>
                                            )}
                                        </div>

                                        {/* Property Type Selection */}
                                        <div>
                                            <label className='block text-xs font-semibold text-[#3D3129] uppercase tracking-wider mb-2 font-poppins'>
                                                Accommodation Type
                                            </label>
                                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                                                {PROPERTY_TYPES.map((type) => {
                                                    const isSelected = formData.propertyType === type.value;
                                                    return (
                                                        <button
                                                            key={type.value}
                                                            type='button'
                                                            onClick={() => setFormData((prev) => ({ ...prev, propertyType: type.value }))}
                                                            className={`p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer flex items-start justify-between ${
                                                                isSelected
                                                                    ? 'border-primary bg-[#FFF0E6]/50 ring-1 ring-primary'
                                                                    : 'border-[#3D3129]/15 bg-[#FAF7F5]/30 hover:bg-[#FFF0E6]/20'
                                                            }`}
                                                        >
                                                            <div>
                                                                <p className={`text-sm font-semibold ${isSelected ? 'text-primary' : 'text-[#3D3129]'}`}>
                                                                    {type.label}
                                                                </p>
                                                                <p className='text-xs text-[#3D3129]/60 mt-0.5'>
                                                                    {type.desc}
                                                                </p>
                                                            </div>
                                                            {isSelected && (
                                                                <IoCheckmarkCircle className='text-primary text-lg flex-shrink-0 mt-0.5' />
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 2: Pricing & Location */}
                                    <div className='bg-white rounded-2xl p-5 sm:p-7 border border-[#FF6300]/15 shadow-sm'>
                                        <div className='flex items-center gap-2 mb-4'>
                                            <div className='w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-lg'>
                                                <IoPricetagOutline />
                                            </div>
                                            <div>
                                                <h2 className='text-base font-semibold text-[#3D3129] font-poppins'>
                                                    Pricing & Location
                                                </h2>
                                                <p className='text-xs text-[#3D3129]/60'>
                                                    Annual rent and physical address
                                                </p>
                                            </div>
                                        </div>

                                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5'>
                                            {/* Annual Price */}
                                            <div>
                                                <label htmlFor='priceAnnually' className='block text-xs font-semibold text-[#3D3129] uppercase tracking-wider mb-2 font-poppins'>
                                                    Annual Rent (₦) <span className='text-red-500'>*</span>
                                                </label>
                                                <div className='relative'>
                                                    <span className='absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#3D3129]/60'>
                                                        ₦
                                                    </span>
                                                    <input
                                                        type='number'
                                                        id='priceAnnually'
                                                        name='priceAnnually'
                                                        min='0'
                                                        value={formData.priceAnnually}
                                                        onChange={handleChange}
                                                        placeholder='e.g., 650000'
                                                        className={`w-full pl-8 pr-4 py-3 rounded-xl text-sm border bg-[#FAF7F5]/50 focus:bg-white outline-none smooth-transition ${
                                                            validationErrors.priceAnnually
                                                                ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                                                                : 'border-[#3D3129]/15 focus:border-primary'
                                                        }`}
                                                    />
                                                </div>
                                                {monthlyPriceEstimate ? (
                                                    <p className='text-xs text-primary font-medium mt-1.5'>
                                                        ≈ ₦{monthlyPriceEstimate.toLocaleString()} / month
                                                    </p>
                                                ) : (
                                                    <p className='text-[11px] text-[#3D3129]/50 mt-1.5'>
                                                        Full price per calendar year
                                                    </p>
                                                )}
                                                {validationErrors.priceAnnually && (
                                                    <p className='text-xs text-red-500 mt-1'>{validationErrors.priceAnnually}</p>
                                                )}
                                            </div>

                                            {/* Minimum Rental Period */}
                                            <div>
                                                <label htmlFor='minimumRentalPeriod' className='block text-xs font-semibold text-[#3D3129] uppercase tracking-wider mb-2 font-poppins'>
                                                    Min. Lease Duration
                                                </label>
                                                <div className='relative'>
                                                    <span className='absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3D3129]/50 text-base'>
                                                        <IoTimeOutline />
                                                    </span>
                                                    <select
                                                        id='minimumRentalPeriod'
                                                        name='minimumRentalPeriod'
                                                        value={formData.minimumRentalPeriod}
                                                        onChange={handleChange}
                                                        className='w-full pl-9 pr-4 py-3 rounded-xl text-sm border border-[#3D3129]/15 bg-[#FAF7F5]/50 focus:bg-white focus:border-primary outline-none smooth-transition appearance-none cursor-pointer'
                                                    >
                                                        <option value={6}>6 Months</option>
                                                        <option value={12}>1 Year (12 Months)</option>
                                                        <option value={24}>2 Years (24 Months)</option>
                                                    </select>
                                                </div>
                                                <p className='text-[11px] text-[#3D3129]/50 mt-1.5'>
                                                    Standard lease is 12 months
                                                </p>
                                            </div>
                                        </div>

                                        {/* Location / Address */}
                                        <div>
                                            <label htmlFor='location' className='block text-xs font-semibold text-[#3D3129] uppercase tracking-wider mb-2 font-poppins'>
                                                Property Address & Landmark <span className='text-red-500'>*</span>
                                            </label>
                                            <div className='relative'>
                                                <span className='absolute left-3.5 top-3.5 text-[#3D3129]/50 text-base'>
                                                    <IoLocationOutline />
                                                </span>
                                                <input
                                                    type='text'
                                                    id='location'
                                                    name='location'
                                                    value={formData.location}
                                                    onChange={handleChange}
                                                    placeholder='e.g., 18 St. Finbarrs College Road, Akoka, Yaba (200m from Unilag)'
                                                    className={`w-full pl-9 pr-4 py-3 rounded-xl text-sm border bg-[#FAF7F5]/50 focus:bg-white outline-none smooth-transition ${
                                                        validationErrors.location
                                                            ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                                                            : 'border-[#3D3129]/15 focus:border-primary'
                                                    }`}
                                                />
                                            </div>
                                            {validationErrors.location && (
                                                <p className='text-xs text-red-500 mt-1.5'>{validationErrors.location}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Section 3: Amenities */}
                                    <div className='bg-white rounded-2xl p-5 sm:p-7 border border-[#FF6300]/15 shadow-sm'>
                                        <div className='flex items-center justify-between mb-4'>
                                            <div>
                                                <h2 className='text-base font-semibold text-[#3D3129] font-poppins'>
                                                    Amenities & Facilities
                                                </h2>
                                                <p className='text-xs text-[#3D3129]/60'>
                                                    Update features available to tenants
                                                </p>
                                            </div>
                                            <span className='text-xs font-medium text-primary font-poppins bg-primary/10 px-2.5 py-1 rounded-full'>
                                                {selectedAmenities.length} selected
                                            </span>
                                        </div>

                                        {/* Amenity Chips */}
                                        <div className='flex flex-wrap gap-2 mb-3'>
                                            {POPULAR_AMENITIES.map((amenity) => {
                                                const isSelected = selectedAmenities.includes(amenity);
                                                return (
                                                    <button
                                                        key={amenity}
                                                        type='button'
                                                        onClick={() => toggleAmenity(amenity)}
                                                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                                                            isSelected
                                                                ? 'bg-primary text-white shadow-sm'
                                                                : 'bg-[#FAF7F5] text-[#3D3129]/75 hover:bg-[#FFF0E6] hover:text-primary border border-[#3D3129]/10'
                                                        }`}
                                                    >
                                                        {isSelected && <IoCheckmarkCircle className='text-sm' />}
                                                        <span>{amenity}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Custom Amenities Section (if any added) */}
                                        {selectedAmenities.filter((a) => !POPULAR_AMENITIES.includes(a)).length > 0 && (
                                            <div className='mb-4 pt-2 border-t border-black/5'>
                                                <p className='text-[11px] font-semibold text-[#3D3129]/60 uppercase tracking-wider mb-2 font-poppins'>
                                                    Custom Amenities Added:
                                                </p>
                                                <div className='flex flex-wrap gap-2'>
                                                    {selectedAmenities
                                                        .filter((a) => !POPULAR_AMENITIES.includes(a))
                                                        .map((amenity) => (
                                                            <span
                                                                key={amenity}
                                                                className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-primary text-white shadow-sm'
                                                            >
                                                                <IoCheckmarkCircle className='text-sm' />
                                                                <span>{amenity}</span>
                                                                <button
                                                                    type='button'
                                                                    onClick={() => toggleAmenity(amenity)}
                                                                    className='hover:bg-black/20 rounded-full p-0.5 transition-colors cursor-pointer ml-0.5'
                                                                    title={`Remove ${amenity}`}
                                                                >
                                                                    <IoCloseCircle className='text-sm' />
                                                                </button>
                                                            </span>
                                                        ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Add Custom Amenity Input */}
                                        <div className='flex gap-2 pt-2 border-t border-black/5'>
                                            <input
                                                type='text'
                                                value={customAmenity}
                                                onChange={(e) => setCustomAmenity(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleAddCustomAmenity(e);
                                                    }
                                                }}
                                                placeholder='Add custom amenity (e.g. Swimming Pool)...'
                                                className='flex-1 px-3.5 py-2 rounded-xl text-xs border border-[#3D3129]/15 bg-[#FAF7F5]/50 focus:bg-white focus:border-primary outline-none'
                                            />
                                            <button
                                                type='button'
                                                onClick={handleAddCustomAmenity}
                                                className='px-3.5 py-2 rounded-xl bg-[#FFF0E6] hover:bg-primary/20 text-primary text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors'
                                            >
                                                <IoAdd className='text-base' /> Add
                                            </button>
                                        </div>
                                    </div>

                                    {/* Section 4: Detailed Description */}
                                    <div className='bg-white rounded-2xl p-5 sm:p-7 border border-[#FF6300]/15 shadow-sm'>
                                        <div className='flex items-center justify-between mb-3'>
                                            <div>
                                                <h2 className='text-base font-semibold text-[#3D3129] font-poppins'>
                                                    Property Description
                                                </h2>
                                                <p className='text-xs text-[#3D3129]/60'>
                                                    Describe features, light schedule, or rules
                                                </p>
                                            </div>
                                            <span className='text-xs text-[#3D3129]/50 font-mono'>
                                                {formData.description.length}/800
                                            </span>
                                        </div>

                                        <textarea
                                            name='description'
                                            rows={4}
                                            maxLength={800}
                                            value={formData.description}
                                            onChange={handleChange}
                                            placeholder='Highlight what makes this accommodation attractive to prospective tenants...'
                                            className='w-full p-4 rounded-xl text-sm border border-[#3D3129]/15 bg-[#FAF7F5]/50 focus:bg-white focus:border-primary outline-none smooth-transition resize-none'
                                        />
                                    </div>
                                </div>

                                {/* Right Column: Media Upload & Actions */}
                                <div className='space-y-6'>
                                    {/* Image Upload Dropzone Card */}
                                    <div className='bg-white rounded-2xl p-5 sm:p-6 border border-[#FF6300]/15 shadow-sm'>
                                        <div className='flex items-center justify-between mb-3'>
                                            <h3 className='text-sm font-semibold text-[#3D3129] font-poppins uppercase tracking-wider'>
                                                Property Photos <span className='text-red-500'>*</span>
                                            </h3>
                                            <span className='text-xs text-[#3D3129]/60'>
                                                {images.length}/{MAX_IMAGES}
                                            </span>
                                        </div>

                                        <p className='text-xs text-[#3D3129]/60 mb-4'>
                                            Maintain at least 1 clear photo. The first image serves as the listing cover.
                                        </p>

                                        {/* Upload Trigger Area */}
                                        {images.length < MAX_IMAGES && (
                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                className='border-2 border-dashed border-primary/40 hover:border-primary bg-[#FFF7F3]/60 hover:bg-[#FFF7F3] rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 group mb-4'
                                            >
                                                <div className='w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center text-2xl group-hover:scale-110 transition-transform mb-2'>
                                                    <IoCloudUploadOutline />
                                                </div>
                                                <p className='text-xs font-semibold text-[#3D3129]'>
                                                    Upload new property photos
                                                </p>
                                                <p className='text-[11px] text-[#3D3129]/50 mt-1'>
                                                    PNG, JPG or WEBP (Max {MAX_IMAGES} photos)
                                                </p>
                                            </div>
                                        )}

                                        {/* Hidden File Input */}
                                        <input
                                            type='file'
                                            ref={fileInputRef}
                                            accept='image/png, image/jpeg, image/jpg, image/webp'
                                            multiple
                                            onChange={handleFileSelect}
                                            className='hidden'
                                        />

                                        {/* Uploaded Images Grid */}
                                        {images.length > 0 && (
                                            <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3'>
                                                {images.map((img, index) => (
                                                    <div
                                                        key={index}
                                                        className='relative rounded-xl overflow-hidden aspect-square border border-black/10 group shadow-sm bg-black/5'
                                                    >
                                                        <img
                                                            src={img.preview}
                                                            alt={`Upload ${index + 1}`}
                                                            className='w-full h-full object-cover'
                                                        />

                                                        {/* First image cover badge */}
                                                        {index === 0 && (
                                                            <span className='absolute bottom-1.5 left-1.5 bg-black/70 text-white text-[9px] font-semibold px-2 py-0.5 rounded-full'>
                                                                Cover
                                                            </span>
                                                        )}

                                                        {/* Delete Button */}
                                                        <button
                                                            type='button'
                                                            onClick={() => handleRemoveImage(index)}
                                                            className='absolute top-1.5 right-1.5 text-white bg-black/60 hover:bg-red-600 rounded-full p-1 transition-colors cursor-pointer'
                                                            title='Remove photo'
                                                        >
                                                            <IoCloseCircle className='text-base' />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {validationErrors.images && (
                                            <p className='text-xs text-red-500 mt-3'>{validationErrors.images}</p>
                                        )}
                                    </div>

                                    {/* Action Summary Box */}
                                    <div className='bg-[#FFF0E6]/60 rounded-2xl p-5 border border-[#FF6300]/20'>
                                        <h4 className='text-xs font-semibold text-[#3D3129] uppercase tracking-wider font-poppins mb-3'>
                                            Update Summary
                                        </h4>

                                        <div className='space-y-2.5 text-xs text-[#3D3129]/80 mb-5'>
                                            <div className='flex justify-between'>
                                                <span className='text-[#3D3129]/60'>Listing ID:</span>
                                                <span className='font-semibold'>#{apartmentID}</span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <span className='text-[#3D3129]/60'>Type:</span>
                                                <span className='font-semibold'>
                                                    {PROPERTY_TYPES.find((t) => t.value === formData.propertyType)?.label}
                                                </span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <span className='text-[#3D3129]/60'>Annual Rent:</span>
                                                <span className='font-bold text-primary'>
                                                    {formData.priceAnnually
                                                        ? `₦${Number(formData.priceAnnually).toLocaleString()}`
                                                        : 'Not specified'}
                                                </span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <span className='text-[#3D3129]/60'>Photos:</span>
                                                <span className='font-semibold'>{images.length} photos</span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <span className='text-[#3D3129]/60'>Amenities:</span>
                                                <span className='font-semibold'>{selectedAmenities.length} tags</span>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <button
                                            type='submit'
                                            disabled={isSubmitting}
                                            className='w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold shadow-md shadow-primary/20 flex items-center justify-center gap-2 smooth-transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer mb-2.5'
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className='w-4 h-4 animate-spin text-white' />
                                                    <span>Saving Changes...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <IoSaveOutline className='text-base' />
                                                    <span>Save Changes</span>
                                                </>
                                            )}
                                        </button>

                                        <Link
                                            to={`/landlord/property/${apartmentID}/manage`}
                                            className='block text-center text-xs text-[#3D3129]/70 hover:text-primary py-1.5 transition-colors font-medium'
                                        >
                                            Discard and return to details
                                        </Link>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}
                </main>
            </div>

            {/* Mobile Navigation */}
            <MobileNavigationTab currentTab='home' />
        </div>
    );
};

export default UpdateProperty;