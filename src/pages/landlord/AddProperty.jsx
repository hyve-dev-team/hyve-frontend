import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar/Sidebar';
import Header from './components/layout/Dashboard/Header';
import MobileNavigationTab from './components/layout/MobileNavigation/MobileNavigationTab';
import { createLandlordProperty } from '../../utils/landlordPropertiesApi';
import { addPropertyAgent, formatDisplayPhone } from '../../utils/inspectionApi';
import { uploadMediaFiles } from '../../utils/mediaApi';
import { hyveSuccess, hyveError } from '../../utils/hyveToast';
import AddressAutocompleteInput from '../../components/maps/AddressAutocompleteInput';

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
    IoSparklesOutline,
    IoNavigateOutline
} from 'react-icons/io5';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { FaWhatsapp, FaUserTie } from 'react-icons/fa';
import { FiFileText, FiExternalLink } from 'react-icons/fi';
import LandlordAgreementModal from '../../components/modals/LandlordAgreementModal';

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

const AddProperty = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const docInputRef = useRef(null);

    // Form inputs state
    const [formData, setFormData] = useState({
        title: '',
        priceAnnually: '',
        location: '',
        latitude: null,
        longitude: null,
        propertyType: 'APARTMENT',
        minimumRentalPeriod: 12,
        description: '',
    });

    // Optional Inspection Agent / Caretaker state
    const [agentData, setAgentData] = useState({
        fullName: '',
        whatsappNumber: '',
        roleTitle: 'Caretaker',
    });

    // Amenities state
    const [selectedAmenities, setSelectedAmenities] = useState([
        'Running Water',
        'Security / Gated',
    ]);
    const [customAmenity, setCustomAmenity] = useState('');

    // Images state: array of { file: File, preview: string }
    const [images, setImages] = useState([]);

    // Additional landlord documents (e.g. Tenancy addendums, estate rules, covenants)
    const [landlordDocs, setLandlordDocs] = useState([]);

    // Landlord Custom House Rules State
    const [houseRules, setHouseRules] = useState({
        quietHours: '',
        visitorPolicy: '',
        wasteDays: '',
        petPolicy: '',
        customRules: '',
    });

    // Landlord Custom Utility Info State
    const [utilitiesInfo, setUtilitiesInfo] = useState({
        meterNumber: '',
        waterHours: '',
        generatorSchedule: '',
        wasteFee: '',
    });

    // Landlord Emergency Facility Contacts State
    const [emergencyContacts, setEmergencyContacts] = useState({
        securityPhone: '',
        electricianPhone: '',
        facilityManagerPhone: '',
        plumberPhone: '',
    });

    // UI & Submission state
    const [validationErrors, setValidationErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [showAgreementModal, setShowAgreementModal] = useState(false);

    // Text inputs change handler
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

    // Add custom amenity tag
    const handleAddCustomAmenity = (e) => {
        if (e) e.preventDefault();
        const trimmed = customAmenity.trim();
        if (!trimmed) return;
        if (!selectedAmenities.includes(trimmed)) {
            setSelectedAmenities((prev) => [...prev, trimmed]);
        }
        setCustomAmenity('');
    };

    // Handle files selected from file input
    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const availableSlots = MAX_IMAGES - images.length;
        const toAdd = files.slice(0, availableSlots).map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));

        setImages((prev) => [...prev, ...toAdd]);

        if (validationErrors.images) {
            setValidationErrors((prev) => {
                const updated = { ...prev };
                delete updated.images;
                return updated;
            });
        }

        // Reset input value so the same file can be re-selected if removed
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Remove an uploaded image
    const handleRemoveImage = (indexToRemove) => {
        setImages((prev) => {
            const item = prev[indexToRemove];
            if (item?.preview) URL.revokeObjectURL(item.preview);
            return prev.filter((_, idx) => idx !== indexToRemove);
        });
    };

    // Handle landlord supplementary document upload (PDF, images)
    const handleDocSelect = (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        const toAdd = files.map((file) => ({
            file,
            name: file.name,
            size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        }));
        setLandlordDocs((prev) => [...prev, ...toAdd]);
        if (docInputRef.current) {
            docInputRef.current.value = '';
        }
    };

    const handleRemoveDoc = (indexToRemove) => {
        setLandlordDocs((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    };

    // Form validation
    const validate = () => {
        const errors = {};
        if (!formData.title || !formData.title.trim()) {
            errors.title = 'Property title is required';
        }
        if (!formData.priceAnnually || Number(formData.priceAnnually) <= 0) {
            errors.priceAnnually = 'Please provide a valid annual rent price';
        }
        if (!formData.location || !formData.location.trim()) {
            errors.location = 'Property address / location is required';
        }
        if (!images || images.length === 0) {
            errors.images = 'Please upload at least 1 photo of the property';
        }
        if (!agreedToTerms) {
            errors.agreement = 'You must review and agree to the HYVE Landlord Partnership Agreement before listing';
        }

        setValidationErrors(errors);
        return {
            isValid: Object.keys(errors).length === 0,
            errors,
        };
    };

    // Submission handler
    const handleSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();

        try {
            const { isValid, errors } = validate();
            if (!isValid) {
                const errorList = Object.values(errors);
                const primaryMessage = errorList.length === 1
                    ? errorList[0]
                    : `Please fix: ${errorList.join(', ')}`;
                hyveError('Required Details Missing', primaryMessage);
                return;
            }

            setIsSubmitting(true);

            // 1. Upload images to Cloudinary via backend MediaController
            const rawFiles = images.map((img) => img.file).filter(Boolean);
            const existingUrls = images
                .filter((img) => !img.file && (img.url || img.preview))
                .map((img) => img.url || img.preview);

            let uploadedUrls = [];
            if (rawFiles.length > 0) {
                uploadedUrls = await uploadMediaFiles(rawFiles, 'properties');
            }

            const allImages = [...existingUrls, ...uploadedUrls];

            if (allImages.length === 0) {
                hyveError('Image Upload Error', 'Could not upload property images. Please check your network connection and try again.');
                setIsSubmitting(false);
                return;
            }

            // Upload any supplementary landlord tenancy docs / agreements
            let uploadedDocUrls = [];
            const rawDocs = landlordDocs.map((doc) => doc.file).filter(Boolean);
            if (rawDocs.length > 0) {
                try {
                    uploadedDocUrls = await uploadMediaFiles(rawDocs, 'kyc');
                } catch (docErr) {
                    console.warn("Could not upload supplementary tenancy docs:", docErr);
                }
            }

            // 2. Call backend Landlord Properties creation API
            const payload = {
                title: formData.title.trim(),
                description: formData.description.trim() || `${formData.propertyType} located at ${formData.location.trim()}`,
                priceAnnually: Number(formData.priceAnnually),
                location: formData.location.trim(),
                propertyType: formData.propertyType,
                amenities: selectedAmenities,
                images: allImages,
                landlordDocUrls: uploadedDocUrls,
                houseRules: JSON.stringify(houseRules),
                utilitiesInfo: JSON.stringify(utilitiesInfo),
                emergencyContacts: JSON.stringify(emergencyContacts),
                minimumRentalPeriod: Number(formData.minimumRentalPeriod) || 12,
                ...(formData.latitude != null ? { latitude: formData.latitude } : {}),
                ...(formData.longitude != null ? { longitude: formData.longitude } : {}),
            };

            const createdProperty = await createLandlordProperty(payload);

            // If agent details provided, attach agent to the property immediately
            if (agentData.fullName.trim() && agentData.whatsappNumber.trim() && createdProperty?.id) {
                try {
                    await addPropertyAgent(createdProperty.id, {
                        fullName: agentData.fullName.trim(),
                        whatsappNumber: formatDisplayPhone(agentData.whatsappNumber.trim()),
                        roleTitle: agentData.roleTitle || 'Caretaker',
                        isPrimary: true,
                    });
                } catch (agentErr) {
                    console.warn('Agent could not be attached immediately:', agentErr);
                }
            }

            hyveSuccess('Property published!', 'Your property and inspection contacts have been saved.');
            navigate('/landlord/dashboard');
        } catch (err) {
            console.error('Failed to create property:', err);
            const msg = err?.message || 'Could not upload property. Please try again.';
            hyveError('Property Listing Failed', msg);
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
                <Sidebar currentPage='add_property' />

                {/* Main Content Area */}
                <main className='w-full h-[100svh] sm:w-[70%] lg:w-[80%] overflow-auto bg-[#FAF7F5]/50'>
                    {/* Header */}
                    <Header />

                    <div className='px-4 sm:px-8 py-8 pb-28 max-w-6xl mx-auto'>
                        {/* Top navigation breadcrumb & title */}
                        <div className='flex flex-wrap items-center justify-between gap-4 mb-8'>
                            <div>
                                <Link
                                    to='/landlord/dashboard'
                                    className='inline-flex items-center gap-1.5 text-xs text-[#3D3129]/60 hover:text-primary transition-colors mb-2 font-medium'
                                >
                                    <IoArrowBack /> Back to Dashboard
                                </Link>
                                <h1 className='text-2xl lg:text-3xl font-bold text-[#3D3129] font-poppins'>
                                    Add New Property
                                </h1>
                                <p className='text-xs sm:text-sm text-[#3D3129]/60 mt-1'>
                                    Fill in the details below to publish a new listing on Hyve.
                                </p>
                            </div>

                            <div className='flex items-center gap-3'>
                                <Link
                                    to='/landlord/dashboard'
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
                                            <span>Publishing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <IoSparklesOutline className='text-base' />
                                            <span>Publish Listing</span>
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
                                                Basic title and category of the accommodation
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
                                            className={`w-full px-4 py-3 rounded-xl text-sm border bg-[#FAF7F5]/50 focus:bg-white outline-none smooth-transition ${validationErrors.title
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
                                                        className={`p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer flex items-start justify-between ${isSelected
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
                                                Set the annual rent and physical location
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
                                                    className={`w-full pl-8 pr-4 py-3 rounded-xl text-sm border bg-[#FAF7F5]/50 focus:bg-white outline-none smooth-transition ${validationErrors.priceAnnually
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

                                    {/* Location / Address via Google Maps Autocomplete & Geocoding */}
                                    <div>
                                        <label htmlFor='location' className='block text-xs font-semibold text-[#3D3129] uppercase tracking-wider mb-2 font-poppins'>
                                            Property Address & Landmark <span className='text-red-500'>*</span>
                                        </label>
                                        <AddressAutocompleteInput
                                            value={formData.location}
                                            latitude={formData.latitude}
                                            longitude={formData.longitude}
                                            onChangeAddress={({ location, latitude, longitude }) => {
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    location,
                                                    latitude,
                                                    longitude,
                                                }));
                                                if (validationErrors.location) {
                                                    setValidationErrors((prev) => {
                                                        const updated = { ...prev };
                                                        delete updated.location;
                                                        return updated;
                                                    });
                                                }
                                            }}
                                            hasError={!!validationErrors.location}
                                            errorMessage={validationErrors.location}
                                            placeholder='e.g. 18 St. Finbarrs College Road, Akoka, Yaba, Lagos'
                                        />
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
                                                Select all features available to tenants
                                            </p>
                                        </div>
                                        <span className='text-xs font-medium text-primary font-poppins bg-primary/10 px-2.5 py-1 rounded-full'>
                                            {selectedAmenities.length} selected
                                        </span>
                                    </div>

                                    {/* Amenity Chips (Popular) */}
                                    <div className='flex flex-wrap gap-2 mb-3'>
                                        {POPULAR_AMENITIES.map((amenity) => {
                                            const isSelected = selectedAmenities.includes(amenity);
                                            return (
                                                <button
                                                    key={amenity}
                                                    type='button'
                                                    onClick={() => toggleAmenity(amenity)}
                                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${isSelected
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
                                                Describe proximity to school gates, rules, light schedule, etc.
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
                                        placeholder='Highlight what makes this accommodation attractive to prospective tenants — constant water running, serene compound, prepaid meter, etc.'
                                        className='w-full p-4 rounded-xl text-sm border border-[#3D3129]/15 bg-[#FAF7F5]/50 focus:bg-white focus:border-primary outline-none smooth-transition resize-none'
                                    />
                                </div>

                                {/* Section 5: Inspection Agent / Caretaker (Optional) */}
                                <div className='bg-white rounded-2xl p-5 sm:p-7 border border-[#FF6300]/15 shadow-sm'>
                                    <div className='flex items-center justify-between mb-3'>
                                        <div>
                                            <h2 className='text-base font-semibold text-[#3D3129] font-poppins flex items-center gap-2'>
                                                <FaUserTie className='text-primary text-sm' />
                                                <span>Inspection Agent / Caretaker</span>
                                                <span className='text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase'>
                                                    Optional
                                                </span>
                                            </h2>
                                            <p className='text-xs text-[#3D3129]/60 mt-0.5'>
                                                Assign who will receive tour viewing links on WhatsApp. If left blank, requests route directly to your WhatsApp number.
                                            </p>
                                        </div>
                                    </div>

                                    <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2'>
                                        <div>
                                            <label className='block text-xs font-medium text-[#4B5563] mb-1'>Agent Full Name</label>
                                            <input
                                                type='text'
                                                placeholder='e.g. Babatunde Lawal'
                                                value={agentData.fullName}
                                                onChange={(e) => setAgentData(prev => ({ ...prev, fullName: e.target.value }))}
                                                className='w-full px-3.5 py-2.5 rounded-xl text-xs border border-[#3D3129]/15 bg-[#FAF7F5]/50 focus:bg-white focus:border-primary outline-none'
                                            />
                                        </div>

                                        <div>
                                            <label className='block text-xs font-medium text-[#4B5563] mb-1'>Agent WhatsApp Number</label>
                                            <div className='flex items-center rounded-xl border border-[#3D3129]/15 bg-[#FAF7F5]/50 overflow-hidden focus-within:bg-white focus-within:border-primary focus-within:ring-1 focus-within:ring-primary'>
                                                <div className='flex items-center gap-1.5 px-3 py-2.5 bg-gray-50 border-r border-[#E5E7EB] text-xs font-semibold text-gray-700 select-none shrink-0'>
                                                    <span>🇳🇬</span>
                                                    <span>+234</span>
                                                </div>
                                                <input
                                                    type='tel'
                                                    placeholder='805 623 7380 (or 080...)'
                                                    value={agentData.whatsappNumber}
                                                    onChange={(e) => {
                                                        let val = e.target.value;
                                                        if (val.startsWith("+234")) val = val.slice(4).trim();
                                                        else if (val.startsWith("234") && val.length > 5) val = val.slice(3).trim();
                                                        if (val.startsWith("0")) val = val.slice(1).trim();
                                                        setAgentData(prev => ({ ...prev, whatsappNumber: val }));
                                                    }}
                                                    className='w-full px-3 py-2.5 text-xs bg-transparent outline-none'
                                                />
                                            </div>
                                            <p className='text-[10px] text-gray-500 mt-1'>
                                                Country code +234 is handled automatically.
                                            </p>
                                        </div>

                                        <div>
                                            <label className='block text-xs font-medium text-[#4B5563] mb-1'>Role / Designation</label>
                                            <select
                                                value={agentData.roleTitle}
                                                onChange={(e) => setAgentData(prev => ({ ...prev, roleTitle: e.target.value }))}
                                                className='w-full px-3.5 py-2.5 rounded-xl text-xs border border-[#3D3129]/15 bg-[#FAF7F5]/50 focus:bg-white focus:border-primary outline-none'
                                            >
                                                <option value='Caretaker'>Caretaker</option>
                                                <option value='Facility Manager'>Facility Manager</option>
                                                <option value='Viewing Agent'>Viewing Agent</option>
                                                <option value='Co-Landlord'>Co-Landlord</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 6: Landlord Supplementary Tenancy Documents / Addendums (Optional) */}
                                <div className='bg-white rounded-2xl p-5 sm:p-7 border border-[#FF6300]/15 shadow-sm'>
                                    <div className='flex items-center justify-between mb-3'>
                                        <div>
                                            <h2 className='text-base font-semibold text-[#3D3129] font-poppins flex items-center gap-2'>
                                                <FiFileText className='text-primary text-sm' />
                                                <span>Custom Tenancy Agreement / Estate Rules</span>
                                                <span className='text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full uppercase'>
                                                    Optional
                                                </span>
                                            </h2>
                                            <p className='text-xs text-[#3D3129]/60 mt-0.5'>
                                                Have your own tenancy agreement, code of conduct, or estate bylaws? Attach them here so tenants must review and accept them before paying rent.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Upload trigger button */}
                                    <div className='pt-2'>
                                        <button
                                            type='button'
                                            onClick={() => docInputRef.current?.click()}
                                            className='px-4 py-2.5 rounded-xl border border-dashed border-primary/40 hover:border-primary bg-orange-50/40 hover:bg-orange-50 text-xs font-semibold text-primary flex items-center gap-2 transition-colors cursor-pointer'
                                        >
                                            <IoAdd className='text-base' />
                                            <span>Attach Document (PDF, JPG, PNG)</span>
                                        </button>
                                        <input
                                            type='file'
                                            ref={docInputRef}
                                            accept='.pdf,image/png,image/jpeg,image/jpg'
                                            multiple
                                            onChange={handleDocSelect}
                                            className='hidden'
                                        />
                                    </div>

                                    {/* List of uploaded documents */}
                                    {landlordDocs.length > 0 && (
                                        <div className='mt-3.5 space-y-2'>
                                            {landlordDocs.map((doc, idx) => (
                                                <div
                                                    key={idx}
                                                    className='flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-xs'
                                                >
                                                    <div className='flex items-center gap-2.5 truncate max-w-[80%]'>
                                                        <div className='w-7 h-7 rounded-lg bg-orange-100 text-primary flex items-center justify-center shrink-0'>
                                                            <FiFileText className='text-sm' />
                                                        </div>
                                                        <div className='truncate'>
                                                            <p className='font-medium text-stone-800 truncate'>{doc.name}</p>
                                                            <p className='text-[10px] text-stone-400'>{doc.size}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type='button'
                                                        onClick={() => handleRemoveDoc(idx)}
                                                        className='text-stone-400 hover:text-red-500 p-1 transition-colors cursor-pointer'
                                                        title='Remove document'
                                                    >
                                                        <IoCloseCircle className='text-lg' />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Section 7: House Rules & Estate Policies (Landlord Customizable) */}
                                <div className='bg-white rounded-2xl p-5 sm:p-7 border border-[#FF6300]/15 shadow-sm'>
                                    <div className='mb-4'>
                                        <h2 className='text-base font-semibold text-[#3D3129] font-poppins flex items-center gap-2'>
                                            <span>🌙</span>
                                            <span>House Rules & Estate Policies</span>
                                            <span className='text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase'>
                                                Customizable
                                            </span>
                                        </h2>
                                        <p className='text-xs text-[#3D3129]/60 mt-0.5'>
                                            Specify your property's actual rules so tenants see accurate expectations instead of default templates.
                                        </p>
                                    </div>

                                    <div className='space-y-3.5'>
                                        <div>
                                            <label className='block text-xs font-medium text-[#4B5563] mb-1'>
                                                🌙 Quiet Hours Policy
                                            </label>
                                            <input
                                                type='text'
                                                placeholder='e.g. Observed daily from 10:00 PM to 7:00 AM. Avoid loud music.'
                                                value={houseRules.quietHours}
                                                onChange={(e) => setHouseRules((prev) => ({ ...prev, quietHours: e.target.value }))}
                                                className='w-full px-3.5 py-2.5 rounded-xl text-xs border border-[#3D3129]/15 bg-[#FAF7F5]/50 focus:bg-white focus:border-primary outline-none'
                                            />
                                        </div>

                                        <div>
                                            <label className='block text-xs font-medium text-[#4B5563] mb-1'>
                                                👥 Visitor & Guest Policy
                                            </label>
                                            <input
                                                type='text'
                                                placeholder='e.g. Overnight visitors staying over 3 consecutive days must register with security.'
                                                value={houseRules.visitorPolicy}
                                                onChange={(e) => setHouseRules((prev) => ({ ...prev, visitorPolicy: e.target.value }))}
                                                className='w-full px-3.5 py-2.5 rounded-xl text-xs border border-[#3D3129]/15 bg-[#FAF7F5]/50 focus:bg-white focus:border-primary outline-none'
                                            />
                                        </div>

                                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3.5'>
                                            <div>
                                                <label className='block text-xs font-medium text-[#4B5563] mb-1'>
                                                    🗑️ Waste Disposal Days
                                                </label>
                                                <input
                                                    type='text'
                                                    placeholder='e.g. Tuesdays & Fridays, bag neatly.'
                                                    value={houseRules.wasteDays}
                                                    onChange={(e) => setHouseRules((prev) => ({ ...prev, wasteDays: e.target.value }))}
                                                    className='w-full px-3.5 py-2.5 rounded-xl text-xs border border-[#3D3129]/15 bg-[#FAF7F5]/50 focus:bg-white focus:border-primary outline-none'
                                                />
                                            </div>

                                            <div>
                                                <label className='block text-xs font-medium text-[#4B5563] mb-1'>
                                                    🐾 Pet Policy
                                                </label>
                                                <input
                                                    type='text'
                                                    placeholder='e.g. No dogs allowed / Small cats permitted with consent.'
                                                    value={houseRules.petPolicy}
                                                    onChange={(e) => setHouseRules((prev) => ({ ...prev, petPolicy: e.target.value }))}
                                                    className='w-full px-3.5 py-2.5 rounded-xl text-xs border border-[#3D3129]/15 bg-[#FAF7F5]/50 focus:bg-white focus:border-primary outline-none'
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className='block text-xs font-medium text-[#4B5563] mb-1'>
                                                📝 Other Compound Rules (Optional)
                                            </label>
                                            <textarea
                                                rows={2}
                                                placeholder='Add any additional rules (e.g. compound gate locks at 11pm, no smoking inside flat)...'
                                                value={houseRules.customRules}
                                                onChange={(e) => setHouseRules((prev) => ({ ...prev, customRules: e.target.value }))}
                                                className='w-full p-3 rounded-xl text-xs border border-[#3D3129]/15 bg-[#FAF7F5]/50 focus:bg-white focus:border-primary outline-none resize-none'
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Section 8: Utility Information (Landlord Customizable) */}
                                <div className='bg-white rounded-2xl p-5 sm:p-7 border border-[#FF6300]/15 shadow-sm'>
                                    <div className='mb-4'>
                                        <h2 className='text-base font-semibold text-[#3D3129] font-poppins flex items-center gap-2'>
                                            <span>⚡</span>
                                            <span>Utility Information & Schedules</span>
                                            <span className='text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase'>
                                                Customizable
                                            </span>
                                        </h2>
                                        <p className='text-xs text-[#3D3129]/60 mt-0.5'>
                                            Provide the tenant with your apartment's prepaid meter number and utility routines.
                                        </p>
                                    </div>

                                    <div className='space-y-3.5'>
                                        <div>
                                            <label className='block text-xs font-medium text-[#4B5563] mb-1'>
                                                ⚡ Prepaid Electricity Meter Number
                                            </label>
                                            <input
                                                type='text'
                                                placeholder='e.g. 0412-8821-9943'
                                                value={utilitiesInfo.meterNumber}
                                                onChange={(e) => setUtilitiesInfo((prev) => ({ ...prev, meterNumber: e.target.value }))}
                                                className='w-full px-3.5 py-2.5 rounded-xl text-xs font-mono border border-[#3D3129]/15 bg-[#FAF7F5]/50 focus:bg-white focus:border-primary outline-none'
                                            />
                                        </div>

                                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3.5'>
                                            <div>
                                                <label className='block text-xs font-medium text-[#4B5563] mb-1'>
                                                    💧 Water Pumping Hours
                                                </label>
                                                <input
                                                    type='text'
                                                    placeholder='e.g. 6:00 AM – 8:00 AM & 6:00 PM – 8:00 PM'
                                                    value={utilitiesInfo.waterHours}
                                                    onChange={(e) => setUtilitiesInfo((prev) => ({ ...prev, waterHours: e.target.value }))}
                                                    className='w-full px-3.5 py-2.5 rounded-xl text-xs border border-[#3D3129]/15 bg-[#FAF7F5]/50 focus:bg-white focus:border-primary outline-none'
                                                />
                                            </div>

                                            <div>
                                                <label className='block text-xs font-medium text-[#4B5563] mb-1'>
                                                    🔌 Generator Schedule (if applicable)
                                                </label>
                                                <input
                                                    type='text'
                                                    placeholder='e.g. 7:00 PM – 11:00 PM on grid failure'
                                                    value={utilitiesInfo.generatorSchedule}
                                                    onChange={(e) => setUtilitiesInfo((prev) => ({ ...prev, generatorSchedule: e.target.value }))}
                                                    className='w-full px-3.5 py-2.5 rounded-xl text-xs border border-[#3D3129]/15 bg-[#FAF7F5]/50 focus:bg-white focus:border-primary outline-none'
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 9: Emergency Facility Contacts (Landlord Customizable) */}
                                <div className='bg-white rounded-2xl p-5 sm:p-7 border border-[#FF6300]/15 shadow-sm'>
                                    <div className='mb-4'>
                                        <h2 className='text-base font-semibold text-[#3D3129] font-poppins flex items-center gap-2'>
                                            <span>📞</span>
                                            <span>Emergency Facility Contacts</span>
                                            <span className='text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase'>
                                                Customizable
                                            </span>
                                        </h2>
                                        <p className='text-xs text-[#3D3129]/60 mt-0.5'>
                                            Input real contacts for your estate or building so tenants reach the right technicians in emergencies.
                                        </p>
                                    </div>

                                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3.5'>
                                        <div>
                                            <label className='block text-xs font-medium text-[#4B5563] mb-1'>
                                                Estate Security Post Phone
                                            </label>
                                            <input
                                                type='tel'
                                                placeholder='e.g. 0801 111 2222'
                                                value={emergencyContacts.securityPhone}
                                                onChange={(e) => setEmergencyContacts((prev) => ({ ...prev, securityPhone: e.target.value }))}
                                                className='w-full px-3.5 py-2.5 rounded-xl text-xs border border-[#3D3129]/15 bg-[#FAF7F5]/50 focus:bg-white focus:border-primary outline-none'
                                            />
                                        </div>

                                        <div>
                                            <label className='block text-xs font-medium text-[#4B5563] mb-1'>
                                                Resident Electrician Phone
                                            </label>
                                            <input
                                                type='tel'
                                                placeholder='e.g. 0803 333 4444'
                                                value={emergencyContacts.electricianPhone}
                                                onChange={(e) => setEmergencyContacts((prev) => ({ ...prev, electricianPhone: e.target.value }))}
                                                className='w-full px-3.5 py-2.5 rounded-xl text-xs border border-[#3D3129]/15 bg-[#FAF7F5]/50 focus:bg-white focus:border-primary outline-none'
                                            />
                                        </div>

                                        <div>
                                            <label className='block text-xs font-medium text-[#4B5563] mb-1'>
                                                Estate Facility Manager Phone
                                            </label>
                                            <input
                                                type='tel'
                                                placeholder='e.g. 0805 555 6666'
                                                value={emergencyContacts.facilityManagerPhone}
                                                onChange={(e) => setEmergencyContacts((prev) => ({ ...prev, facilityManagerPhone: e.target.value }))}
                                                className='w-full px-3.5 py-2.5 rounded-xl text-xs border border-[#3D3129]/15 bg-[#FAF7F5]/50 focus:bg-white focus:border-primary outline-none'
                                            />
                                        </div>

                                        <div>
                                            <label className='block text-xs font-medium text-[#4B5563] mb-1'>
                                                Resident Plumber Phone
                                            </label>
                                            <input
                                                type='tel'
                                                placeholder='e.g. 0802 222 3333'
                                                value={emergencyContacts.plumberPhone}
                                                onChange={(e) => setEmergencyContacts((prev) => ({ ...prev, plumberPhone: e.target.value }))}
                                                className='w-full px-3.5 py-2.5 rounded-xl text-xs border border-[#3D3129]/15 bg-[#FAF7F5]/50 focus:bg-white focus:border-primary outline-none'
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Media Upload & Summary Card */}
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
                                        Upload at least 1 clear photo. The first image will be used as the cover photo.
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
                                                Click to upload property photos
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
                                                        title='Remove image'
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

                                {/* Publishing Summary Box */}
                                <div className='bg-[#FFF0E6]/60 rounded-2xl p-5 border border-[#FF6300]/20'>
                                    <h4 className='text-xs font-semibold text-[#3D3129] uppercase tracking-wider font-poppins mb-3'>
                                        Listing Summary
                                    </h4>

                                    <div className='space-y-2.5 text-xs text-[#3D3129]/80 mb-5'>
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
                                            <span className='text-[#3D3129]/60'>Photos attached:</span>
                                            <span className='font-semibold'>{images.length}</span>
                                        </div>
                                        <div className='flex justify-between'>
                                            <span className='text-[#3D3129]/60'>Amenities:</span>
                                            <span className='font-semibold'>{selectedAmenities.length} tags</span>
                                        </div>
                                    </div>

                                    {/* Landlord Partnership Agreement Checkbox */}
                                    <div className='mb-4 p-3.5 rounded-xl border border-stone-200 bg-white shadow-xs'>
                                        <label className='flex items-start gap-2.5 cursor-pointer select-none'>
                                            <input
                                                type='checkbox'
                                                checked={agreedToTerms}
                                                onChange={(e) => {
                                                    setAgreedToTerms(e.target.checked);
                                                    if (e.target.checked && validationErrors.agreement) {
                                                        setValidationErrors((prev) => {
                                                            const copy = { ...prev };
                                                            delete copy.agreement;
                                                            return copy;
                                                        });
                                                    }
                                                }}
                                                className='mt-0.5 w-4 h-4 rounded text-primary focus:ring-primary/30 border-stone-300 cursor-pointer accent-primary'
                                            />
                                            <div className='text-xs leading-snug text-stone-700'>
                                                <span>I have read and agree to the </span>
                                                <button
                                                    type='button'
                                                    onClick={() => setShowAgreementModal(true)}
                                                    className='text-primary font-bold hover:underline inline-flex items-center gap-0.5 cursor-pointer'
                                                >
                                                    HYVE Landlord Partnership Agreement
                                                    <FiExternalLink className='text-[10px]' />
                                                </button>
                                                <span className='block text-[11px] text-stone-400 mt-0.5'>
                                                    5% annual commission upon successful rental · Lagos State compliant
                                                </span>
                                            </div>
                                        </label>
                                        {validationErrors.agreement && (
                                            <p className='text-[11px] text-red-500 font-medium mt-1.5 pl-6.5'>
                                                {validationErrors.agreement}
                                            </p>
                                        )}
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
                                                <span>Publishing Listing...</span>
                                            </>
                                        ) : (
                                            <span>Publish Property</span>
                                        )}
                                    </button>

                                    <Link
                                        to='/landlord/dashboard'
                                        className='block text-center text-xs text-[#3D3129]/70 hover:text-primary py-1.5 transition-colors font-medium'
                                    >
                                        Cancel and return to dashboard
                                    </Link>
                                </div>
                            </div>
                        </form>
                    </div>
                </main>
            </div>

            {/* Reusable Landlord Partnership Agreement Modal */}
            <LandlordAgreementModal
                isOpen={showAgreementModal}
                onClose={() => setShowAgreementModal(false)}
                onAccept={() => {
                    setAgreedToTerms(true);
                    if (validationErrors.agreement) {
                        setValidationErrors((prev) => {
                            const copy = { ...prev };
                            delete copy.agreement;
                            return copy;
                        });
                    }
                }}
                hasAccepted={agreedToTerms}
                showAcceptButton={true}
                propertyAddress={formData.location}
            />

            {/* Mobile Navigation */}
            <MobileNavigationTab currentTab='add_property' />
        </div>
    );
};

export default AddProperty;


