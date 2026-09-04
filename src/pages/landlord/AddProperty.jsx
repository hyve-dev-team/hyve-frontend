// import { useState, useRef } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import Sidebar from './components/layout/Sidebar/Sidebar';
// import Header from './components/layout/Dashboard/Header';
// import MobileNavigationTab from './components/layout/MobileNavigation/MobileNavigationTab';
// import { createLandlordProperty } from '../../utils/landlordPropertiesApi';
// import { uploadMediaFiles } from '../../utils/mediaApi';
// import { hyveSuccess, hyveError } from '../../utils/hyveToast';

// import {
//     IoHomeOutline,
//     IoLocationOutline,
//     IoPricetagOutline,
//     IoCloudUploadOutline,
//     IoCloseCircle,
//     IoCheckmarkCircle,
//     IoArrowBack,
//     IoAdd,
//     IoTimeOutline,
//     IoSparklesOutline
// } from 'react-icons/io5';
// import { Loader2 } from 'lucide-react';

// const PROPERTY_TYPES = [
//     { value: 'APARTMENT', label: 'Apartment', desc: 'Flat or multiple rooms' },
//     { value: 'STUDIO', label: 'Self-Contain / Studio', desc: 'Private room with bath & kitchen' },
//     { value: 'ROOM', label: 'Single Room', desc: 'Private room with shared bath' },
//     { value: 'HOUSE', label: 'Entire House', desc: 'Full building / duplex' },
// ];

// const POPULAR_AMENITIES = [
//     'Running Water',
//     '24/7 Power / Generator',
//     'Pre-paid Meter',
//     'Security / Gated',
//     'WiFi Internet',
//     'Air Conditioning',
//     'Kitchen Cabinets',
//     'Wardrobe',
//     'Parking Space',
//     'Furnished',
//     'Balcony',
//     'Tiled Floor',
// ];

// const MAX_IMAGES = 6;

// const AddProperty = () => {
//     const navigate = useNavigate();
//     const fileInputRef = useRef(null);

//     // Form inputs state
//     const [formData, setFormData] = useState({
//         title: '',
//         priceAnnually: '',
//         location: '',
//         propertyType: 'APARTMENT',
//         minimumRentalPeriod: 12,
//         description: '',
//     });

//     // Amenities state
//     const [selectedAmenities, setSelectedAmenities] = useState([
//         'Running Water',
//         'Security / Gated',
//     ]);
//     const [customAmenity, setCustomAmenity] = useState('');

//     // Images state: array of { file: File, preview: string }
//     const [images, setImages] = useState([]);

//     // UI & Submission state
//     const [validationErrors, setValidationErrors] = useState({});
//     const [isSubmitting, setIsSubmitting] = useState(false);

//     // Text inputs change handler
//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData((prev) => ({ ...prev, [name]: value }));

//         if (validationErrors[name]) {
//             setValidationErrors((prev) => {
//                 const updated = { ...prev };
//                 delete updated[name];
//                 return updated;
//             });
//         }
//     };

//     // Toggle amenity selection
//     const toggleAmenity = (amenity) => {
//         setSelectedAmenities((prev) =>
//             prev.includes(amenity)
//                 ? prev.filter((a) => a !== amenity)
//                 : [...prev, amenity]
//         );
//     };

//     // Add custom amenity tag
//     const handleAddCustomAmenity = (e) => {
//         if (e) e.preventDefault();
//         const trimmed = customAmenity.trim();
//         if (!trimmed) return;
//         if (!selectedAmenities.includes(trimmed)) {
//             setSelectedAmenities((prev) => [...prev, trimmed]);
//         }
//         setCustomAmenity('');
//     };

//     // Handle files selected from file input
//     const handleFileSelect = (e) => {
//         const files = Array.from(e.target.files || []);
//         if (!files.length) return;

//         const availableSlots = MAX_IMAGES - images.length;
//         const toAdd = files.slice(0, availableSlots).map((file) => ({
//             file,
//             preview: URL.createObjectURL(file),
//         }));

//         setImages((prev) => [...prev, ...toAdd]);

//         if (validationErrors.images) {
//             setValidationErrors((prev) => {
//                 const updated = { ...prev };
//                 delete updated.images;
//                 return updated;
//             });
//         }

//         // Reset input value so the same file can be re-selected if removed
//         if (fileInputRef.current) {
//             fileInputRef.current.value = '';
//         }
//     };

//     // Remove an uploaded image
//     const handleRemoveImage = (indexToRemove) => {
//         setImages((prev) => {
//             const item = prev[indexToRemove];
//             if (item?.preview) URL.revokeObjectURL(item.preview);
//             return prev.filter((_, idx) => idx !== indexToRemove);
//         });
//     };

//     // Form validation
//     const validate = () => {
//         const errors = {};
//         if (!formData.title.trim()) {
//             errors.title = 'Property title is required';
//         }
//         if (!formData.priceAnnually || Number(formData.priceAnnually) <= 0) {
//             errors.priceAnnually = 'Please provide a valid annual rent price';
//         }
//         if (!formData.location.trim()) {
//             errors.location = 'Property address / location is required';
//         }
//         if (images.length === 0) {
//             errors.images = 'Please upload at least 1 photo of the property';
//         }

//         // Validate Video (last slot)
//         if (!uploadedMedia[VIDEO_SLOT_INDEX]) {
//             errors.video = true;
//             isValid = false;
//         }

//         setValidationErrors(errors);
//         return Object.keys(errors).length === 0;
//     };

//     // Submission handler
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         if (!validate()) {
//             hyveError('Incomplete form', 'Please check highlighted fields and upload at least one image.');
//             return;
//         }

//         setIsSubmitting(true);

//         try {
//             // 1. Upload images to Cloudinary via backend MediaController
//             const rawFiles = images.map((img) => img.file).filter(Boolean);
//             let uploadedUrls = [];

//             if (rawFiles.length > 0) {
//                 uploadedUrls = await uploadMediaFiles(rawFiles, 'properties');
//             }

//             // Fallback sample URLs if cloud upload returned empty (e.g. dev/credentials)
//             if (uploadedUrls.length === 0) {
//                 uploadedUrls = [
//                     'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
//                     'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'
//                 ];
//             }

//             // 2. Call backend Landlord Properties creation API
//             const payload = {
//                 title: formData.title.trim(),
//                 description: formData.description.trim() || `${formData.propertyType} located at ${formData.location.trim()}`,
//                 priceAnnually: Number(formData.priceAnnually),
//                 location: formData.location.trim(),
//                 propertyType: formData.propertyType,
//                 amenities: selectedAmenities,
//                 images: uploadedUrls,
//                 minimumRentalPeriod: Number(formData.minimumRentalPeriod) || 12,
//             };

//             await createLandlordProperty(payload);

//             hyveSuccess('Property published!', 'Your property has been listed successfully.');
//             navigate('/landlord/dashboard');
//         } catch (err) {
//             console.error('Failed to create property:', err);
//             const msg = err?.message || 'Could not upload property. Please try again.';
//             hyveError('Upload failed', msg);
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     const monthlyPriceEstimate = formData.priceAnnually && Number(formData.priceAnnually) > 0
//         ? Math.round(Number(formData.priceAnnually) / 12)
//         : null;

//     return (
//         <div className='page-wrapper'>
//             <div className='flex'>
//                 {/* Sidebar */}
//                 <Sidebar currentPage='add_property' />

//                 {/* Main Content Area */}
//                 <main className='w-full h-[100svh] sm:w-[70%] lg:w-[80%] overflow-auto bg-[#FAF7F5]/50'>
//                     {/* Header */}
//                     <Header />

//                     <div className='px-4 sm:px-8 py-8 pb-28 max-w-6xl mx-auto'>
//                         {/* Top navigation breadcrumb & title */}
//                         <div className='flex flex-wrap items-center justify-between gap-4 mb-8'>
//                             <div>
//                                 <Link
//                                     to='/landlord/dashboard'
//                                     className='inline-flex items-center gap-1.5 text-xs text-[#3D3129]/60 hover:text-primary transition-colors mb-2 font-medium'
//                                 >
//                                     <IoArrowBack /> Back to Dashboard
//                                 </Link>
//                                 <h1 className='text-2xl lg:text-3xl font-bold text-[#3D3129] font-poppins'>
//                                     Add New Property
//                                 </h1>
//                                 <p className='text-xs sm:text-sm text-[#3D3129]/60 mt-1'>
//                                     Fill in the details below to publish a new listing on Hyve.
//                                 </p>
//                             </div>

//                             <div className='flex items-center gap-3'>
//                                 <Link
//                                     to='/landlord/dashboard'
//                                     className='px-4 py-2.5 rounded-xl border border-[#3D3129]/20 text-xs sm:text-sm font-medium text-[#3D3129] hover:bg-white transition-colors'
//                                 >
//                                     Cancel
//                                 </Link>
//                                 <button
//                                     type='button'
//                                     onClick={handleSubmit}
//                                     disabled={isSubmitting}
//                                     className='px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-medium shadow-md shadow-primary/20 flex items-center gap-2 smooth-transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer'
//                                 >
//                                     {isSubmitting ? (
//                                         <>
//                                             <Loader2 className='w-4 h-4 animate-spin text-white' />
//                                             <span>Publishing...</span>
//                                         </>
//                                     ) : (
//                                         <>
//                                             <IoSparklesOutline className='text-base' />
//                                             <span>Publish Listing</span>
//                                         </>
//                                     )}
//                                 </button>
//                             </div>
//                         </div>

//                         {/* Form Layout */}
//                         <form onSubmit={handleSubmit} className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
//                             {/* Left 2 Columns: Core Form Details */}
//                             <div className='lg:col-span-2 space-y-6'>
//                                 {/* Section 1: Basic Information */}
//                                 <div className='bg-white rounded-2xl p-5 sm:p-7 border border-[#FF6300]/15 shadow-sm'>
//                                     <div className='flex items-center gap-2 mb-4'>
//                                         <div className='w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-lg'>
//                                             <IoHomeOutline />
//                                         </div>
//                                         <div>
//                                             <h2 className='text-base font-semibold text-[#3D3129] font-poppins'>
//                                                 Property Overview
//                                             </h2>
//                                             <p className='text-xs text-[#3D3129]/60'>
//                                                 Basic title and category of the accommodation
//                                             </p>
//                                         </div>
//                                     </div>

//                                     {/* Property Title */}
//                                     <div className='mb-5'>
//                                         <label htmlFor='title' className='block text-xs font-semibold text-[#3D3129] uppercase tracking-wider mb-2 font-poppins'>
//                                             Property Title <span className='text-red-500'>*</span>
//                                         </label>
//                                         <input
//                                             type='text'
//                                             id='title'
//                                             name='title'
//                                             value={formData.title}
//                                             onChange={handleChange}
//                                             placeholder='e.g., Luxury Studio Apartment near Unilag Gate'
//                                             className={`w-full px-4 py-3 rounded-xl text-sm border bg-[#FAF7F5]/50 focus:bg-white outline-none smooth-transition ${
//                                                 validationErrors.title
//                                                     ? 'border-red-500 focus:ring-1 focus:ring-red-500'
//                                                     : 'border-[#3D3129]/15 focus:border-primary'
//                                             }`}
//                                         />
//                                         {validationErrors.title && (
//                                             <p className='text-xs text-red-500 mt-1.5'>{validationErrors.title}</p>
//                                         )}
//                                     </div>

//                                     {/* Property Type Selection */}
//                                     <div>
//                                         <label className='block text-xs font-semibold text-[#3D3129] uppercase tracking-wider mb-2 font-poppins'>
//                                             Accommodation Type
//                                         </label>
//                                         <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
//                                             {PROPERTY_TYPES.map((type) => {
//                                                 const isSelected = formData.propertyType === type.value;
//                                                 return (
//                                                     <button
//                                                         key={type.value}
//                                                         type='button'
//                                                         onClick={() => setFormData((prev) => ({ ...prev, propertyType: type.value }))}
//                                                         className={`p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer flex items-start justify-between ${
//                                                             isSelected
//                                                                 ? 'border-primary bg-[#FFF0E6]/50 ring-1 ring-primary'
//                                                                 : 'border-[#3D3129]/15 bg-[#FAF7F5]/30 hover:bg-[#FFF0E6]/20'
//                                                         }`}
//                                                     >
//                                                         <div>
//                                                             <p className={`text-sm font-semibold ${isSelected ? 'text-primary' : 'text-[#3D3129]'}`}>
//                                                                 {type.label}
//                                                             </p>
//                                                             <p className='text-xs text-[#3D3129]/60 mt-0.5'>
//                                                                 {type.desc}
//                                                             </p>
//                                                         </div>
//                                                         {isSelected && (
//                                                             <IoCheckmarkCircle className='text-primary text-lg flex-shrink-0 mt-0.5' />
//                                                         )}
//                                                     </button>
//                                                 );
//                                             })}
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Section 2: Pricing & Location */}
//                                 <div className='bg-white rounded-2xl p-5 sm:p-7 border border-[#FF6300]/15 shadow-sm'>
//                                     <div className='flex items-center gap-2 mb-4'>
//                                         <div className='w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-lg'>
//                                             <IoPricetagOutline />
//                                         </div>
//                                         <div>
//                                             <h2 className='text-base font-semibold text-[#3D3129] font-poppins'>
//                                                 Pricing & Location
//                                             </h2>
//                                             <p className='text-xs text-[#3D3129]/60'>
//                                                 Set the annual rent and physical location
//                                             </p>
//                                         </div>
//                                     </div>

//                                     <div className='grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5'>
//                                         {/* Annual Price */}
//                                         <div>
//                                             <label htmlFor='priceAnnually' className='block text-xs font-semibold text-[#3D3129] uppercase tracking-wider mb-2 font-poppins'>
//                                                 Annual Rent (₦) <span className='text-red-500'>*</span>
//                                             </label>
//                                             <div className='relative'>
//                                                 <span className='absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#3D3129]/60'>
//                                                     ₦
//                                                 </span>
//                                                 <input
//                                                     type='number'
//                                                     id='priceAnnually'
//                                                     name='priceAnnually'
//                                                     min='0'
//                                                     value={formData.priceAnnually}
//                                                     onChange={handleChange}
//                                                     placeholder='e.g., 650000'
//                                                     className={`w-full pl-8 pr-4 py-3 rounded-xl text-sm border bg-[#FAF7F5]/50 focus:bg-white outline-none smooth-transition ${
//                                                         validationErrors.priceAnnually
//                                                             ? 'border-red-500 focus:ring-1 focus:ring-red-500'
//                                                             : 'border-[#3D3129]/15 focus:border-primary'
//                                                     }`}
//                                                 />
//                                             </div>
//                                             {monthlyPriceEstimate ? (
//                                                 <p className='text-xs text-primary font-medium mt-1.5'>
//                                                     ≈ ₦{monthlyPriceEstimate.toLocaleString()} / month
//                                                 </p>
//                                             ) : (
//                                                 <p className='text-[11px] text-[#3D3129]/50 mt-1.5'>
//                                                     Full price per calendar year
//                                                 </p>
//                                             )}
//                                             {validationErrors.priceAnnually && (
//                                                 <p className='text-xs text-red-500 mt-1'>{validationErrors.priceAnnually}</p>
//                                             )}
//                                         </div>

//                                         {/* Minimum Rental Period */}
//                                         <div>
//                                             <label htmlFor='minimumRentalPeriod' className='block text-xs font-semibold text-[#3D3129] uppercase tracking-wider mb-2 font-poppins'>
//                                                 Min. Lease Duration
//                                             </label>
//                                             <div className='relative'>
//                                                 <span className='absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3D3129]/50 text-base'>
//                                                     <IoTimeOutline />
//                                                 </span>
//                                                 <select
//                                                     id='minimumRentalPeriod'
//                                                     name='minimumRentalPeriod'
//                                                     value={formData.minimumRentalPeriod}
//                                                     onChange={handleChange}
//                                                     className='w-full pl-9 pr-4 py-3 rounded-xl text-sm border border-[#3D3129]/15 bg-[#FAF7F5]/50 focus:bg-white focus:border-primary outline-none smooth-transition appearance-none cursor-pointer'
//                                                 >
//                                                     <option value={6}>6 Months</option>
//                                                     <option value={12}>1 Year (12 Months)</option>
//                                                     <option value={24}>2 Years (24 Months)</option>
//                                                 </select>
//                                             </div>
//                                             <p className='text-[11px] text-[#3D3129]/50 mt-1.5'>
//                                                 Standard lease is 12 months
//                                             </p>
//                                         </div>
//                                     </div>

//                                     {/* Location / Address */}
//                                     <div>
//                                         <label htmlFor='location' className='block text-xs font-semibold text-[#3D3129] uppercase tracking-wider mb-2 font-poppins'>
//                                             Property Address & Landmark <span className='text-red-500'>*</span>
//                                         </label>
//                                         <div className='relative'>
//                                             <span className='absolute left-3.5 top-3.5 text-[#3D3129]/50 text-base'>
//                                                 <IoLocationOutline />
//                                             </span>
//                                             <input
//                                                 type='text'
//                                                 id='location'
//                                                 name='location'
//                                                 value={formData.location}
//                                                 onChange={handleChange}
//                                                 placeholder='e.g., 18 St. Finbarrs College Road, Akoka, Yaba (200m from Unilag)'
//                                                 className={`w-full pl-9 pr-4 py-3 rounded-xl text-sm border bg-[#FAF7F5]/50 focus:bg-white outline-none smooth-transition ${
//                                                     validationErrors.location
//                                                         ? 'border-red-500 focus:ring-1 focus:ring-red-500'
//                                                         : 'border-[#3D3129]/15 focus:border-primary'
//                                                 }`}
//                                             />
//                                         </div>
//                                         {validationErrors.location && (
//                                             <p className='text-xs text-red-500 mt-1.5'>{validationErrors.location}</p>
//                                         )}
//                                     </div>
//                                 </div>

//                                 {/* Section 3: Amenities */}
//                                 <div className='bg-white rounded-2xl p-5 sm:p-7 border border-[#FF6300]/15 shadow-sm'>
//                                     <div className='flex items-center justify-between mb-4'>
//                                         <div>
//                                             <h2 className='text-base font-semibold text-[#3D3129] font-poppins'>
//                                                 Amenities & Facilities
//                                             </h2>
//                                             <p className='text-xs text-[#3D3129]/60'>
//                                                 Select all features available to tenants
//                                             </p>
//                                         </div>
//                                         <span className='text-xs font-medium text-primary font-poppins bg-primary/10 px-2.5 py-1 rounded-full'>
//                                             {selectedAmenities.length} selected
//                                         </span>
//                                     </div>

//                                     {/* Amenity Chips (Popular) */}
//                                     <div className='flex flex-wrap gap-2 mb-3'>
//                                         {POPULAR_AMENITIES.map((amenity) => {
//                                             const isSelected = selectedAmenities.includes(amenity);
//                                             return (
//                                                 <button
//                                                     key={amenity}
//                                                     type='button'
//                                                     onClick={() => toggleAmenity(amenity)}
//                                                     className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
//                                                         isSelected
//                                                             ? 'bg-primary text-white shadow-sm'
//                                                             : 'bg-[#FAF7F5] text-[#3D3129]/75 hover:bg-[#FFF0E6] hover:text-primary border border-[#3D3129]/10'
//                                                     }`}
//                                                 >
//                                                     {isSelected && <IoCheckmarkCircle className='text-sm' />}
//                                                     <span>{amenity}</span>
//                                                 </button>
//                                             );
//                                         })}
//                                     </div>

//                                     {/* Custom Amenities Section (if any added) */}
//                                     {selectedAmenities.filter((a) => !POPULAR_AMENITIES.includes(a)).length > 0 && (
//                                         <div className='mb-4 pt-2 border-t border-black/5'>
//                                             <p className='text-[11px] font-semibold text-[#3D3129]/60 uppercase tracking-wider mb-2 font-poppins'>
//                                                 Custom Amenities Added:
//                                             </p>
//                                             <div className='flex flex-wrap gap-2'>
//                                                 {selectedAmenities
//                                                     .filter((a) => !POPULAR_AMENITIES.includes(a))
//                                                     .map((amenity) => (
//                                                         <span
//                                                             key={amenity}
//                                                             className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-primary text-white shadow-sm'
//                                                         >
//                                                             <IoCheckmarkCircle className='text-sm' />
//                                                             <span>{amenity}</span>
//                                                             <button
//                                                                 type='button'
//                                                                 onClick={() => toggleAmenity(amenity)}
//                                                                 className='hover:bg-black/20 rounded-full p-0.5 transition-colors cursor-pointer ml-0.5'
//                                                                 title={`Remove ${amenity}`}
//                                                             >
//                                                                 <IoCloseCircle className='text-sm' />
//                                                             </button>
//                                                         </span>
//                                                     ))}
//                                             </div>
//                                         </div>
//                                     )}

//                                     {/* Add Custom Amenity Input */}
//                                     <div className='flex gap-2 pt-2 border-t border-black/5'>
//                                         <input
//                                             type='text'
//                                             value={customAmenity}
//                                             onChange={(e) => setCustomAmenity(e.target.value)}
//                                             onKeyDown={(e) => {
//                                                 if (e.key === 'Enter') {
//                                                     e.preventDefault();
//                                                     handleAddCustomAmenity(e);
//                                                 }
//                                             }}
//                                             placeholder='Add custom amenity (e.g. Swimming Pool)...'
//                                             className='flex-1 px-3.5 py-2 rounded-xl text-xs border border-[#3D3129]/15 bg-[#FAF7F5]/50 focus:bg-white focus:border-primary outline-none'
//                                         />
//                                         <button
//                                             type='button'
//                                             onClick={handleAddCustomAmenity}
//                                             className='px-3.5 py-2 rounded-xl bg-[#FFF0E6] hover:bg-primary/20 text-primary text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors'
//                                         >
//                                             <IoAdd className='text-base' /> Add
//                                         </button>
//                                     </div>
//                                 </div>

//                                 {/* Section 4: Detailed Description */}
//                                 <div className='bg-white rounded-2xl p-5 sm:p-7 border border-[#FF6300]/15 shadow-sm'>
//                                     <div className='flex items-center justify-between mb-3'>
//                                         <div>
//                                             <h2 className='text-base font-semibold text-[#3D3129] font-poppins'>
//                                                 Property Description
//                                             </h2>
//                                             <p className='text-xs text-[#3D3129]/60'>
//                                                 Describe proximity to school gates, rules, light schedule, etc.
//                                             </p>
//                                         </div>
//                                         <span className='text-xs text-[#3D3129]/50 font-mono'>
//                                             {formData.description.length}/800
//                                         </span>
//                                     </div>

//                                     <textarea
//                                         name='description'
//                                         rows={4}
//                                         maxLength={800}
//                                         value={formData.description}
//                                         onChange={handleChange}
//                                         placeholder='Highlight what makes this accommodation attractive to prospective tenants — constant water running, serene compound, prepaid meter, etc.'
//                                         className='w-full p-4 rounded-xl text-sm border border-[#3D3129]/15 bg-[#FAF7F5]/50 focus:bg-white focus:border-primary outline-none smooth-transition resize-none'
//                                     />
//                                 </div>
//                             </div>

//                             {/* Right Column: Media Upload & Summary Card */}
//                             <div className='space-y-6'>
//                                 {/* Image Upload Dropzone Card */}
//                                 <div className='bg-white rounded-2xl p-5 sm:p-6 border border-[#FF6300]/15 shadow-sm'>
//                                     <div className='flex items-center justify-between mb-3'>
//                                         <h3 className='text-sm font-semibold text-[#3D3129] font-poppins uppercase tracking-wider'>
//                                             Property Photos <span className='text-red-500'>*</span>
//                                         </h3>
//                                         <span className='text-xs text-[#3D3129]/60'>
//                                             {images.length}/{MAX_IMAGES}
//                                         </span>
//                                     </div>

//                                     <p className='text-xs text-[#3D3129]/60 mb-4'>
//                                         Upload at least 1 clear photo. The first image will be used as the cover photo.
//                                     </p>

//                                     {/* Upload Trigger Area */}
//                                     {images.length < MAX_IMAGES && (
//                                         <div
//                                             onClick={() => fileInputRef.current?.click()}
//                                             className='border-2 border-dashed border-primary/40 hover:border-primary bg-[#FFF7F3]/60 hover:bg-[#FFF7F3] rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 group mb-4'
//                                         >
//                                             <div className='w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center text-2xl group-hover:scale-110 transition-transform mb-2'>
//                                                 <IoCloudUploadOutline />
//                                             </div>
//                                             <p className='text-xs font-semibold text-[#3D3129]'>
//                                                 Click to upload property photos
//                                             </p>
//                                             <p className='text-[11px] text-[#3D3129]/50 mt-1'>
//                                                 PNG, JPG or WEBP (Max {MAX_IMAGES} photos)
//                                             </p>
//                                         </div>
//                                     )}

//                                     {/* Hidden File Input */}
//                                     <input
//                                         type='file'
//                                         ref={fileInputRef}
//                                         accept='image/png, image/jpeg, image/jpg, image/webp'
//                                         multiple
//                                         onChange={handleFileSelect}
//                                         className='hidden'
//                                     />

//                                     {/* Uploaded Images Grid */}
//                                     {images.length > 0 && (
//                                         <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3'>
//                                             {images.map((img, index) => (
//                                                 <div
//                                                     key={index}
//                                                     className='relative rounded-xl overflow-hidden aspect-square border border-black/10 group shadow-sm bg-black/5'
//                                                 >
//                                                     <img
//                                                         src={img.preview}
//                                                         alt={`Upload ${index + 1}`}
//                                                         className='w-full h-full object-cover'
//                                                     />

//                                                     {/* First image cover badge */}
//                                                     {index === 0 && (
//                                                         <span className='absolute bottom-1.5 left-1.5 bg-black/70 text-white text-[9px] font-semibold px-2 py-0.5 rounded-full'>
//                                                             Cover
//                                                         </span>
//                                                     )}

//                                                     {/* Delete Button */}
//                                                     <button
//                                                         type='button'
//                                                         onClick={() => handleRemoveImage(index)}
//                                                         className='absolute top-1.5 right-1.5 text-white bg-black/60 hover:bg-red-600 rounded-full p-1 transition-colors cursor-pointer'
//                                                         title='Remove image'
//                                                     >
//                                                         <IoCloseCircle className='text-base' />
//                                                     </button>
//                                                 </div>
//                                             ))}
//                                         </div>
//                                     )}

//                                     {validationErrors.images && (
//                                         <p className='text-xs text-red-500 mt-3'>{validationErrors.images}</p>
//                                     )}
//                                 </div>

//                                 {/* Publishing Summary Box */}
//                                 <div className='bg-[#FFF0E6]/60 rounded-2xl p-5 border border-[#FF6300]/20'>
//                                     <h4 className='text-xs font-semibold text-[#3D3129] uppercase tracking-wider font-poppins mb-3'>
//                                         Listing Summary
//                                     </h4>

//                                     <div className='space-y-2.5 text-xs text-[#3D3129]/80 mb-5'>
//                                         <div className='flex justify-between'>
//                                             <span className='text-[#3D3129]/60'>Type:</span>
//                                             <span className='font-semibold'>
//                                                 {PROPERTY_TYPES.find((t) => t.value === formData.propertyType)?.label}
//                                             </span>
//                                         </div>
//                                         <div className='flex justify-between'>
//                                             <span className='text-[#3D3129]/60'>Annual Rent:</span>
//                                             <span className='font-bold text-primary'>
//                                                 {formData.priceAnnually
//                                                     ? `₦${Number(formData.priceAnnually).toLocaleString()}`
//                                                     : 'Not specified'}
//                                             </span>
//                                         </div>
//                                         <div className='flex justify-between'>
//                                             <span className='text-[#3D3129]/60'>Photos attached:</span>
//                                             <span className='font-semibold'>{images.length}</span>
//                                         </div>
//                                         <div className='flex justify-between'>
//                                             <span className='text-[#3D3129]/60'>Amenities:</span>
//                                             <span className='font-semibold'>{selectedAmenities.length} tags</span>
//                                         </div>
//                                     </div>

//                                     {/* Action Buttons */}
//                                     <button
//                                         type='submit'
//                                         disabled={isSubmitting}
//                                         className='w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold shadow-md shadow-primary/20 flex items-center justify-center gap-2 smooth-transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer mb-2.5'
//                                     >
//                                         {isSubmitting ? (
//                                             <>
//                                                 <Loader2 className='w-4 h-4 animate-spin text-white' />
//                                                 <span>Publishing Listing...</span>
//                                             </>
//                                         ) : (
//                                             <span>Publish Property</span>
//                                         )}
//                                     </button>

//                                     <Link
//                                         to='/landlord/dashboard'
//                                         className='block text-center text-xs text-[#3D3129]/70 hover:text-primary py-1.5 transition-colors font-medium'
//                                     >
//                                         Cancel and return to dashboard
//                                     </Link>
//                                 </div>
//                             </div>
//                         </form>
//                     </div>
//                 </main>
//             </div>

//             {/* Mobile Navigation */}
//             <MobileNavigationTab currentTab='add_property' />
//         </div>
//     );
// };

// export default AddProperty;


import { useState, useRef } from 'react';
import axios from 'axios';

import Sidebar from './components/layout/Sidebar/Sidebar'
import Header from './components/layout/Dashboard/Header'
import MobileNavigationTab from './components/layout/MobileNavigation/MobileNavigationTab'

import { IoMdAdd } from "react-icons/io";
import { BiEdit } from "react-icons/bi";

// Media slots: 5 images + 1 video
const MAX_IMAGES = 5;
const TOTAL_SLOTS = 6;
const VIDEO_SLOT_INDEX = 5; // last slot is the video

const AMENITIES_OPTIONS = [
    "Parking",
    "Swimming Pool",
    "Security",
    "Gym",
    "WiFi",
    "Generator",
];

const UPLOAD_ENDPOINT = "https://api.example.com/upload"; // TODO: replace with your real endpoint

// Fields that should only accept digits
const NUMERIC_FIELDS = ["price", "recurringPrice", "propertySize"];

const AddProperty = () => {
    // State for text inputs
    const [formData, setFormData] = useState({
        property_name: '',
        price: '',
        recurringPrice: '',
        location: '',
        condition: '',
        propertySize: '',
        minRentalPeriod: '',
        description: ''
    });

    // Amenities are multi-select, kept separate from formData since it's an array not a string
    const [selectedAmenities, setSelectedAmenities] = useState([]);
    const [amenitiesOpen, setAmenitiesOpen] = useState(false);
    const amenitiesRef = useRef(null);

    // State to track validation errors (which fields are empty)
    const [validationErrors, setValidationErrors] = useState({});

    // State for media uploads: array of {file, preview, type: "image" | "video"} objects
    // Indexes 0-4 are images, index 5 is the video
    const [uploadedMedia, setUploadedMedia] = useState(Array(TOTAL_SLOTS).fill(null));
    const [descLimit, setDescLimit] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    // Ref for the hidden file inputs
    const fileInputRef = useRef([]);


    // Handlers for text inputs and textarea(description)
    const handleChange = (e) => {
        const { id, value, name } = e.target;

        // 'id' for named inputs, 'name' for the textarea
        const fieldName = id || name;

        // Strip non-digits for numeric-only fields
        const nextValue = NUMERIC_FIELDS.includes(fieldName)
            ? value.replace(/[^0-9]/g, '')
            : value;

        if (fieldName === 'description') {
            setDescLimit(nextValue.length);
        }

        setFormData(prevData => ({
            ...prevData,
            [fieldName]: nextValue,
        }));

        // Clear the error for this field as the user starts typing
        if (validationErrors[fieldName]) {
            setValidationErrors(prevErrors => {
                const newErrors = { ...prevErrors };
                delete newErrors[fieldName];
                return newErrors;
            });
        }
    };

    const handleKeyUp = (e) => {
        let textareaLength = e.target.value.length;
        setDescLimit(textareaLength); // set descLimit to the number of words typed
        handleChange(e); // update the value of description
    };

    // Amenities dropdown toggle
    const toggleAmenity = (item) => {
        setSelectedAmenities((prev) =>
            prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
        );

        if (validationErrors.amenities) {
            setValidationErrors(prevErrors => {
                const newErrors = { ...prevErrors };
                delete newErrors.amenities;
                return newErrors;
            });
        }
    };

    // Form Validation
    const validateForm = () => {
        const errors = {};
        let isValid = true;

        // Validate Text/Description Inputs
        Object.keys(formData).forEach(key => {
            if (formData[key].trim() === '') {
                errors[key] = true;
                isValid = false;
            }
        });

        // Validate Amenities (at least one selected)
        if (selectedAmenities.length === 0) {
            errors.amenities = true;
            isValid = false;
        }

        // Validate Images (first 5 slots)
        const imageSlots = uploadedMedia.slice(0, MAX_IMAGES);
        if (imageSlots.filter(item => item !== null).length !== MAX_IMAGES) {
            errors.images = true;
            isValid = false;
        }

        // Validate Video (last slot)
        if (!uploadedMedia[VIDEO_SLOT_INDEX]) {
            errors.video = true;
            isValid = false;
        }

        setValidationErrors(errors);
        return isValid;
    };

    // Upload images/video to the API, returns { urls: [...] } or null on failure
    const uploadMedia = async (files) => {
        const body = new FormData();
        files.forEach((file) => body.append("files", file));

        try {
            const response = await axios.post(UPLOAD_ENDPOINT, body, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return response.data; // expected shape: { urls: [...] }
        } catch (err) {
            console.error("Upload error:", err);
            return null;
        }
    };

    // Submission Handler
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const imageFiles = uploadedMedia.slice(0, MAX_IMAGES).map(item => item.file);
        const videoFile = uploadedMedia[VIDEO_SLOT_INDEX]?.file ?? null;
        const allFiles = videoFile ? [...imageFiles, videoFile] : imageFiles;

        setSubmitting(true);

        const uploadResult = await uploadMedia(allFiles);

        const property = {
            ...formData,
            amenities: selectedAmenities,
            mediaUrls: uploadResult ? uploadResult.urls : [],
        };

        console.log('PROPERTY CREATED:', property);

        setSubmitting(false);

        // Proceed to send `property` data to your create-property endpoint here
    };


    // Function to trigger the hidden file input click
    const handleImageClick = (index) => {
        fileInputRef.current[index]?.click();
    };

    // Function to handle the file selection change for a given slot
    const handleImageUpload = (e, index) => {
        const file = e.target.files[0];
        if (file) {
            // Create a temporary URL for preview
            const previewUrl = URL.createObjectURL(file);
            const type = index === VIDEO_SLOT_INDEX ? "video" : "image";

            setUploadedMedia(prevMedia => {
                const newMedia = [...prevMedia];
                newMedia[index] = { file, preview: previewUrl, type };
                return newMedia;
            });

            const errorKey = index === VIDEO_SLOT_INDEX ? "video" : "images";
            if (validationErrors[errorKey]) {
                setValidationErrors(prevErrors => {
                    const newErrors = { ...prevErrors };
                    delete newErrors[errorKey];
                    return newErrors;
                });
            }
        }
    };

    // Render Media Upload/Preview Grid (5 images + 1 video)
    const renderMediaSlots = () => {
        return uploadedMedia.map((media, index) => {
            const isVideoSlot = index === VIDEO_SLOT_INDEX;

            return (
                <div
                    key={index}
                    className={`bg-[#FFF7F3] flex justify-center p-2 rounded-xl cursor-pointer smooth-transition relative group hover:bg-[#FF630040]/10`}
                    onClick={() => handleImageClick(index)}
                >
                    {/* Hidden File Input */}
                    <input
                        type="file"
                        id={`media-upload-${index}`}
                        accept={isVideoSlot ? "video/*" : ".jpg, .jpeg, .png, .webp"}
                        ref={el => fileInputRef.current[index] = el}
                        onChange={(e) => handleImageUpload(e, index)}
                        style={{ display: 'none' }}
                    />


                    <div className='relative flex items-center justify-center w-full overflow-hidden rounded-lg aspect-square'>
                        {media ? (
                            // Media Preview Display
                            <>
                                {media.type === "video" ? (
                                    <video
                                        src={media.preview}
                                        muted
                                        className='object-cover w-full h-full'
                                    />
                                ) : (
                                    <img
                                        src={media.preview}
                                        alt="Property media"
                                        className='object-cover w-full h-full'
                                    />
                                )}

                                {/* Overlay for hover effect */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 bg-black/30 lg:group-hover:opacity-100 smooth-transition">
                                    <BiEdit className="text-[25px] text-white" />
                                </div>
                            </>
                        ) : (
                            // Upload Placeholder
                            <div className='flex items-center justify-center w-20 h-20 bg-[#FF630040]/20 rounded-full '>
                                <div className='bg-[#FF630040]/20 rounded-full w-14 h-14 flex items-center justify-center '>
                                    <IoMdAdd className='text-white text-[30px]' />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            );
        });
    };


    // Helper function for input class names: ONLY applies red border to text/textarea.
    const getInputClassName = (id) => {
        return `upload_new_property ${validationErrors[id] ? 'border-red-500 border' : ''}`;
    };

    return (
        <div className='page-wrapper'>
            <div className='flex'>
                {/* dashboard sidebar*/}
                <Sidebar currentPage={"add_property"} />

                {/* dashboard content area */}
                <main className='w-full h-[100svh] sm:w-[70%] lg:w-[80%] overflow-auto'>
                    {/* dashboard header */}
                    <Header />
                    <div className='px-3 mt-8 pb-28 sm:pb-16 sm:px-6 lg:px-8 lg:mt-8'>

                        <div>
                            <h5 className='font-poppins'>Add Property</h5>
                        </div>

                        {/* Attach ref to form for scrolling */}
                        <form method='POST' className='mt-4' onSubmit={handleSubmit}>
                            <div className='flex flex-col gap-16 lg:flex-row'>
                                <div className='flex flex-col w-full gap-4'>
                                    {/* Input Fields */}
                                    <div>
                                        <input
                                            type="text"
                                            id='property_name'
                                            className={getInputClassName('property_name')}
                                            placeholder='Property Name'
                                            value={formData.property_name}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            id='price'
                                            className={getInputClassName('price')}
                                            placeholder='First Year Price'
                                            value={formData.price}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            id='recurringPrice'
                                            className={getInputClassName('recurringPrice')}
                                            placeholder='Recurring Price'
                                            value={formData.recurringPrice}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            id='location'
                                            className={getInputClassName('location')}
                                            placeholder='Location'
                                            value={formData.location}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            id='condition'
                                            className={getInputClassName('condition')}
                                            placeholder='Condition'
                                            value={formData.condition}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            id='propertySize'
                                            className={getInputClassName('propertySize')}
                                            placeholder='Property Size (sqm)'
                                            value={formData.propertySize}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            id='minRentalPeriod'
                                            className={getInputClassName('minRentalPeriod')}
                                            placeholder='Minimum Rental Period (e.g. 6 months)'
                                            value={formData.minRentalPeriod}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    {/* Amenities multi-select dropdown */}
                                    <div className='relative' ref={amenitiesRef}>
                                        <div
                                            onClick={() => setAmenitiesOpen((v) => !v)}
                                            className={getInputClassName('amenities') + ' cursor-pointer flex items-center'}
                                        >
                                            {selectedAmenities.length
                                                ? selectedAmenities.join(", ")
                                                : "Amenities"}
                                        </div>

                                        {amenitiesOpen && (
                                            <div className='absolute left-0 z-10 w-full p-3 mt-1 bg-white border rounded-xl border-[#0000001A]'>
                                                {AMENITIES_OPTIONS.map((item) => (
                                                    <label
                                                        key={item}
                                                        className='flex items-center gap-2 py-1 text-sm cursor-pointer'
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedAmenities.includes(item)}
                                                            onChange={() => toggleAmenity(item)}
                                                        />
                                                        {item}
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Text Area */}
                                    <div>
                                        <textarea
                                            id='description'
                                            name='description'
                                            className={`h-28 ${getInputClassName('description')}`}
                                            maxLength={500}
                                            placeholder='Description'
                                            value={formData.description}
                                            onChange={handleKeyUp}
                                        />
                                        <span className='flex justify-end text-sm'>
                                            {descLimit}/500
                                        </span>
                                    </div>
                                </div>

                                <div className='w-full'>
                                    <div>
                                        <p className='text-sm text-[#8F3800]'>Upload 5 images and 1 video of the Property</p>
                                    </div>

                                    {/* Media Upload Grid: 5 images + 1 video */}
                                    <div className='grid grid-cols-2 gap-4 mt-4 sm:grid-cols-3 lg:grid-cols-3 '>
                                        {renderMediaSlots()}
                                    </div>

                                    {/* Error Messages (If validation fails) */}
                                    {(validationErrors.amenities || validationErrors.condition || validationErrors.description || validationErrors.location || validationErrors.price || validationErrors.recurringPrice || validationErrors.property_name || validationErrors.propertySize || validationErrors.minRentalPeriod) && (
                                        <p className='mt-4 text-xs text-red-500'>Please ensure all details are Filled</p>
                                    )}

                                    {validationErrors.images && (
                                        <p className='mt-2 text-xs text-red-500'>Please upload all {MAX_IMAGES} required images.</p>
                                    )}

                                    {validationErrors.video && (
                                        <p className='mt-2 text-xs text-red-500'>Please upload 1 video of the property.</p>
                                    )}

                                    <div className='w-full mt-16 lg:mt-16'>
                                        <p className='text-sm text-[#555555] text-center w-[80%] sm:w-[50%] lg:w-[60%] mx-auto'>After files upload and details filled, please upload here.</p>
                                        <button
                                            type='submit'
                                            disabled={submitting}
                                            className='w-full py-3 mt-4 text-white bg-primary hover:bg-primary-hover smooth-transition rounded-xl disabled:opacity-60'
                                        >
                                            {submitting ? "Uploading..." : "Upload"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </main>
            </div>

            {/* Mobile navigation */}
            <MobileNavigationTab currentTab={"add_property"} />
        </div>
    )
}

export default AddProperty;