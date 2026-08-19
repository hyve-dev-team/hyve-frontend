import { useState, useRef } from 'react';

import Sidebar from './components/layout/Sidebar/Sidebar'
import Header from './components/layout/Dashboard/Header'
import MobileNavigationTab from './components/layout/MobileNavigation/MobileNavigationTab'

import { IoMdAdd } from "react-icons/io";
import { BiEdit } from "react-icons/bi";

// Maximun number of Images to be uploaded
const MAX_IMAGES = 6;

const UpdateProperty = () => {
    // State for text inputs
    const [formData, setFormData] = useState({
        property_name: '',
        price: '',
        recurringPrice: '',
        location: '',
        address: '',
        condition: '',
        amenities: '',
        description: ''
    });

    // State to track validation errors (which fields are empty)
    const [validationErrors, setValidationErrors] = useState({});

    // State for image uploads: stores an array of {file: File, preview: string} objects
    const [uploadedImages, setUploadedImages] = useState(Array(MAX_IMAGES).fill(null)); // Initialize with nulls for placeholders
    const [descLimit, setDescLimit] = useState(0);

    // Ref for the hidden file input
    const fileInputRef = useRef([]);


    // Handlers for text inputs and textarea(description)
    const handleChange = (e) => {
        const { id, value, name } = e.target;

        // 'id' for named inputs, 'name' for the textarea
        const fieldName = id || name;

        if (fieldName === 'description') {
            setDescLimit(value.length);
        }

        setFormData(prevData => ({
            ...prevData,
            [fieldName]: value,
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

        //  Validate Images
        const imageFiles = uploadedImages.filter(img => img !== null);
        if (imageFiles.length !== MAX_IMAGES) {
            errors.images = true;
            isValid = false;
        }

        setValidationErrors(errors);
        return isValid;
    };

    // Submission Handler 
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Filter out null values to get only successfully uploaded image objects
        const imageFiles = uploadedImages.filter(img => img !== null).map(img => img.file);

        console.log('Text Inputs:', formData);
        console.log('Image Files:', imageFiles);
        // console.log('Total images uploaded:', imageFiles.length);

        // Proceed to send data to endpoint:
    };


    // Function to trigger the hidden file input click
    const handleImageClick = (index) => {
        fileInputRef.current[index]?.click();
    };

    // Function to handle the file selection change
    const handleImageUpload = (e, index) => {
        const file = e.target.files[0];
        if (file) {
            // Create a temporary URL for preview
            const previewUrl = URL.createObjectURL(file);

            setUploadedImages(prevImages => {
                const newImages = [...prevImages];
                newImages[index] = { file, preview: previewUrl };
                return newImages;
            });
        }
    };

    // Render Image Upload/Preview Grid
    const renderImageSlots = () => {
        return uploadedImages.map((image, index) => (
            <div
                key={index}
                className={`bg-[#FFF7F3] flex justify-center p-2 rounded-xl cursor-pointer smooth-transition relative group hover:bg-[#FF630040]/10`}
                onClick={() => handleImageClick(index)}
            >
                {/* Hidden File Input */}
                <input
                    type="file"
                    id={`image-upload-${index}`}
                    accept=".jpg, .jpeg, .png"
                    ref={el => fileInputRef.current[index] = el}
                    onChange={(e) => handleImageUpload(e, index)}
                    style={{ display: 'none' }}
                />


                <div className='relative flex items-center justify-center w-full overflow-hidden rounded-lg aspect-square'>
                    {image ? (
                        // Image Preview Display
                        <>
                            <img
                                src={image.preview}
                                alt={`Property Image`}
                                className='object-cover w-full h-full'
                            />

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
        ));
    };


    // Helper function for input class names: ONLY applies red border to text/textarea.
    const getInputClassName = (id) => {
        return `upload_new_property ${validationErrors[id] ? 'border-red-500 border' : ''}`;
    };

    return (
        <div className='page-wrapper'>
            <div className='flex'>
                {/* dashboard sidebar*/}
                <Sidebar />

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
                                            id='address'
                                            className={getInputClassName('address')}
                                            placeholder='Address'
                                            value={formData.address}
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
                                            id='amenities'
                                            className={getInputClassName('amenities')}
                                            placeholder='Amenities'
                                            value={formData.amenities}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    {/* Text Area */}
                                    <div>
                                        <textarea
                                            // onKeyUp={handleKeyUp}
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
                                        <p className='text-sm text-[#8F3800]'>Upload Images of Property</p>
                                    </div>

                                    {/* Image Upload Grid */}
                                    <div className='grid grid-cols-2 gap-4 mt-4 sm:grid-cols-3 lg:grid-cols-3 '>
                                        {renderImageSlots()}
                                    </div>

                                    {/* Image Error Message (If validation fails) */}
                                    {(validationErrors.address || validationErrors.amenities || validationErrors.condition || validationErrors.description || validationErrors.location || validationErrors.price || validationErrors.property_name || validationErrors.condition) && (
                                        <p className='mt-4 text-xs text-red-500'>Please ensure all details are Filled</p>
                                    )}

                                    {validationErrors.images && (
                                        <p className='mt-2 text-xs text-red-500'>Please upload all {MAX_IMAGES} required images.</p>
                                    )}

                                    <div className='w-full mt-16 lg:mt-16'>
                                        <p className='text-sm text-[#555555] text-center w-[80%] sm:w-[50%] lg:w-[60%] mx-auto'>After files upload and details filled, please upload here.</p>
                                        <button type='submit' className='w-full py-3 mt-4 text-white bg-primary hover:bg-primary-hover smooth-transition rounded-xl'>Upload</button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </main>
            </div>

            {/* Mobile navigation */}
            <MobileNavigationTab />
        </div>
    )
}

export default UpdateProperty;