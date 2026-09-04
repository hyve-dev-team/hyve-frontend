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