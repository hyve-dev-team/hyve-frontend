"use client"
import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar/Sidebar'
import Header from './components/layout/Dashboard/Header'
import MobileNavigationTab from './components/layout/MobileNavigation/MobileNavigationTab'
import defaultProfile from "../../assets/images/shared-images/user-1.png"
import { hyveSuccess, hyveError } from '../../utils/hyveToast'
import { getPropertyById, addReview } from '../../utils/propertiesApi'
import { getActiveLease } from '../../utils/leaseApi'
import { mapProperty } from '../../utils/mapProperty'
import { getCurrentLodge, clearCurrentLodge, subscribeToCurrentLodgeChanges } from '../../utils/currentLodge'
import { createOrGetChatRoom } from '../../utils/chatApi'
import { FaWhatsapp } from 'react-icons/fa'
import {
    Building2,
    Home,
    ArrowRight,
    MapPin,
    Calendar,
    Clock,
    ShieldCheck,
    CheckCircle2,
    AlertCircle,
    Wrench,
    FileText,
    MessageSquare,
    Phone,
    Mail,
    Star,
    ChevronDown,
    ChevronUp,
    RefreshCw,
    X,
    Printer,
    Check,
    Search,
    Download,
    Copy,
    Bell,
    Truck,
    Sparkles,
    AlertTriangle,
    Shield,
    CheckCheck,
    Send,
    UserCheck,
    ExternalLink
} from 'lucide-react'

const ManageApartment = () => {
    const navigate = useNavigate();

    // Active Navigation Tab
    // 'overview' | 'documents' | 'renewal' | 'rules' | 'services' | 'moveout' | 'reviews'
    const [activeTab, setActiveTab] = useState('overview');

    // Tenancy & Property State
    const [lease, setLease] = useState(null);
    const [property, setProperty] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Synchronize active lease from backend (with local fallback)
    const loadTenancy = useCallback(async () => {
        setIsLoading(true);
        try {
            // 1. Check live lease on backend
            let activeLease = null;
            try {
                activeLease = await getActiveLease();
            } catch {
                activeLease = null;
            }

            if (activeLease && activeLease.property) {
                setLease(activeLease);
                setProperty(mapProperty(activeLease.property));
                setIsLoading(false);
                return;
            }

            // 2. Check local fallback if user previously booked
            const localLodge = getCurrentLodge();
            if (localLodge?.apartmentId) {
                try {
                    const propRes = await getPropertyById(localLodge.apartmentId);
                    if (propRes) {
                        setProperty(mapProperty(propRes));
                        setLease({
                            id: localLodge.leaseId || localLodge.apartmentId,
                            referenceNumber: `HYV-LS-2026-${localLodge.apartmentId}`,
                            moveInDate: localLodge.movedInDate || new Date().toISOString(),
                            rentExpiryDate: localLodge.rentExpiryDate,
                            status: "ACTIVE",
                            property: propRes,
                        });
                        setIsLoading(false);
                        return;
                    }
                } catch {
                    // Stale or forbidden property ID - clear it smoothly
                    clearCurrentLodge();
                }
            }

            // 3. User does not have an active apartment
            setLease(null);
            setProperty(null);
        } catch {
            setLease(null);
            setProperty(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTenancy();
        const unsubscribe = subscribeToCurrentLodgeChanges(loadTenancy);
        return unsubscribe;
    }, [loadTenancy]);

    // Tenancy Dates & Math
    const rentExpiryDate = lease?.rentExpiryDate ? new Date(lease.rentExpiryDate) : null;
    const moveInDate = lease?.moveInDate
        ? new Date(lease.moveInDate)
        : rentExpiryDate
            ? new Date(new Date(rentExpiryDate).setFullYear(new Date(rentExpiryDate).getFullYear() - 1))
            : null;

    const isRentExpired = rentExpiryDate ? (!isNaN(rentExpiryDate.getTime()) && Date.now() >= rentExpiryDate.getTime()) : false;
    const now = new Date();
    const timeDiff = rentExpiryDate ? rentExpiryDate.getTime() - now.getTime() : 0;
    const daysRemaining = rentExpiryDate ? Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24))) : 0;

    const totalLeaseDays = (rentExpiryDate && moveInDate)
        ? Math.max(1, Math.ceil((rentExpiryDate.getTime() - moveInDate.getTime()) / (1000 * 60 * 60 * 24)))
        : 365;
    const daysPassed = (moveInDate)
        ? Math.max(0, Math.ceil((now.getTime() - moveInDate.getTime()) / (1000 * 60 * 60 * 24)))
        : 0;
    const leaseProgress = Math.min(100, Math.max(0, Math.round((daysPassed / totalLeaseDays) * 100)));

    const formattedMoveInDate = moveInDate && !isNaN(moveInDate.getTime())
        ? moveInDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
        : "Not specified";

    const formattedExpiryDate = rentExpiryDate && !isNaN(rentExpiryDate.getTime())
        ? rentExpiryDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
        : "Not specified";

    // Yearly & Monthly Rent
    const monthlyRent = property?.price || 0;
    const yearlyRent = (lease?.annualRent ? Number(lease.annualRent) : (property?.priceAnnually || monthlyRent * 12)) || 0;

    // Payment Status calculation
    const paymentStatus = isRentExpired
        ? { label: "Payment Overdue", color: "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]" }
        : daysRemaining <= 30
            ? { label: `Payment Due Soon (${daysRemaining}d)`, color: "bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]" }
            : { label: "Rent Paid & Active", color: "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]" };

    // Landlord & Caretaker Contacts
    const landlordName = property?.landlord
        ? `${property.landlord.firstName || ''} ${property.landlord.lastName || ''}`.trim() || property.landlord.email || "Property Landlord"
        : "Property Landlord";
    const landlordPhone = property?.landlord?.phone || "+2348000000000";
    const landlordEmail = property?.landlord?.email || "landlord@hyvehaven.com";
    const rawCleanPhone = landlordPhone.replace(/[^0-9]/g, '');
    const whatsappLink = `https://wa.me/${rawCleanPhone.startsWith('0') ? '234' + rawCleanPhone.slice(1) : rawCleanPhone}?text=${encodeURIComponent(`Hello ${landlordName}, I am contacting you regarding my tenancy at ${property?.lodgeDesc || 'the apartment'} on Hyve.`)}`;

    // Gallery state
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const activeImage = property?.images?.[selectedImageIndex] || property?.lodgeImage || null;

    // UI state
    const [isExpanded, setIsExpanded] = useState(false);
    const [isOpeningChat, setIsOpeningChat] = useState(false);
    const [copiedMeter, setCopiedMeter] = useState(false);

    // Modal States
    const [activeModal, setActiveModal] = useState(null); // 'agreement' | 'receipt' | 'inventory' | 'notice' | 'inspection' | 'reminders' | 'service'
    const [serviceType, setServiceType] = useState('Repairs');
    const [serviceDesc, setServiceDesc] = useState('');
    const [isSubmittingService, setIsSubmittingService] = useState(false);

    // Move-out form state
    const [noticeDate, setNoticeDate] = useState('');
    const [noticeReason, setNoticeReason] = useState('Relocation');
    const [forwardingBank, setForwardingBank] = useState('');
    const [forwardingAccount, setForwardingAccount] = useState('');
    const [isSubmittingNotice, setIsSubmittingNotice] = useState(false);
    const [noticeSubmitted, setNoticeSubmitted] = useState(false);

    // Rent Reminder state
    const [reminderSms, setReminderSms] = useState(true);
    const [reminderEmail, setReminderEmail] = useState(true);
    const [reminderWhatsApp, setReminderWhatsApp] = useState(true);
    const [reminderDays, setReminderDays] = useState('30');

    // Review form state
    const [rating, setRating] = useState('');
    const [reviewCategory, setReviewCategory] = useState('Apartment');
    const [reviewText, setReviewText] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    // Handlers
    const handleChatWithLandlord = async () => {
        const landlordId = property?.landlord?.id;
        if (!landlordId) {
            hyveError("No Landlord Found", "This listing does not have an active landlord account on record.");
            return;
        }
        setIsOpeningChat(true);
        try {
            const room = await createOrGetChatRoom(landlordId);
            navigate(`/user/conversation/${room.id}`);
        } catch (err) {
            hyveError("Couldn't open chat", err?.message || "Please try again shortly.");
        } finally {
            setIsOpeningChat(false);
        }
    };

    const handleCopy = (text, label = "Copied to clipboard!") => {
        navigator.clipboard.writeText(text);
        hyveSuccess("Copied!", label);
    };

    const handleServiceSubmit = (e) => {
        e.preventDefault();
        if (!serviceDesc.trim()) {
            hyveError("Missing Details", "Please describe the service required.");
            return;
        }
        setIsSubmittingService(true);
        setTimeout(() => {
            setIsSubmittingService(false);
            setActiveModal(null);
            setServiceDesc('');
            hyveSuccess(
                "Service Request Logged",
                `Your ${serviceType} request (Ticket #SVC-${Math.floor(1000 + Math.random() * 9000)}) has been assigned to verified Hyve partners.`
            );
        }, 600);
    };

    const handleNoticeSubmit = (e) => {
        e.preventDefault();
        if (!noticeDate) {
            hyveError("Date Required", "Please select your planned move-out date.");
            return;
        }
        setIsSubmittingNotice(true);
        setTimeout(() => {
            setIsSubmittingNotice(false);
            setNoticeSubmitted(true);
            setActiveModal(null);
            hyveSuccess("Vacate Notice Acknowledged", "Your landlord and estate manager have been formally notified.");
        }, 600);
    };

    const handleSaveReminders = (e) => {
        e.preventDefault();
        setActiveModal(null);
        hyveSuccess("Reminders Configured", `You will be notified ${reminderDays} days prior to rent expiration via your chosen channels.`);
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!rating) {
            hyveError("Please select a rating", "A star rating is required.");
            return;
        }
        if (!reviewText.trim()) {
            hyveError("Please write feedback", "Tell us about your experience in this lodge.");
            return;
        }

        setIsSubmittingReview(true);
        try {
            await addReview(property.id, {
                rating: Number(rating),
                comment: `[${reviewCategory}] ${reviewText.trim()}`,
            });
            hyveSuccess("Review Submitted", "Thank you for rating your apartment experience!");
            setRating('');
            setReviewText('');
            loadTenancy();
        } catch (err) {
            hyveError("Could not save review", err?.message || "Please try again.");
        } finally {
            setIsSubmittingReview(false);
        }
    };

    return (
        <div className='page-wrapper bg-[#FDFDFD] min-h-screen'>
            <div className='flex'>
                {/* Sidebar */}
                <Sidebar currentPage={"apartment"} />

                {/* Main Content Area */}
                <main className='w-full h-[100svh] sm:w-[70%] lg:w-[80%] overflow-auto'>
                    <Header />

                    <div className='px-3 pt-6 pb-28 sm:pb-16 sm:px-6 lg:px-8 lg:pt-8 max-w-7xl mx-auto'>

                        {/* CASE 1: LOADING STATE */}
                        {isLoading && (
                            <div className="flex flex-col items-center justify-center py-28 text-center">
                                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                                <p className="text-sm font-medium text-[#4B5563]">Retrieving your tenancy records...</p>
                                <p className="text-xs text-[#9CA3AF] mt-1">Connecting to Hyve Escrow & Property Ledger</p>
                            </div>
                        )}

                        {/* CASE 2: USER HAS NO ACTIVE APARTMENT (Direct to Apartment Listings) */}
                        {!isLoading && (!lease || !property) && (
                            <div className="bg-white rounded-3xl border border-[#EAEAEA] p-8 sm:p-14 text-center max-w-2xl mx-auto shadow-sm my-8">
                                <div className="w-20 h-20 rounded-3xl bg-primary-light flex items-center justify-center text-primary mx-auto mb-6 shadow-inner">
                                    <Building2 className="w-10 h-10 text-primary" />
                                </div>

                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB] mb-4">
                                    No Active Tenancy
                                </span>

                                <h2 className="text-2xl sm:text-3xl font-bold font-poppins text-[#1F2937] tracking-tight">
                                    You Don't Have a Rented Apartment Yet
                                </h2>

                                <p className="text-sm sm:text-base text-[#6B7280] max-w-lg mx-auto mt-3 leading-relaxed">
                                    This portal manages your active apartment lease, rent renewals, tenancy agreements, maintenance requests, and landlord communication once your reservation is confirmed.
                                </p>

                                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
                                    <Link
                                        to="/user/dashboard"
                                        className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary-hover shadow-md smooth-transition flex items-center justify-center gap-2"
                                    >
                                        <Home className="w-4 h-4" />
                                        Browse Apartment Listings
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>

                                    <Link
                                        to="/user/apartment/search"
                                        className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-semibold text-[#374151] bg-[#F9FAFB] hover:bg-[#F3F4F6] border border-[#D1D5DB] smooth-transition flex items-center justify-center gap-2"
                                    >
                                        <Search className="w-4 h-4 text-[#6B7280]" />
                                        Search With Filters
                                    </Link>
                                </div>

                                <div className="mt-8 pt-6 border-t border-[#F3F4F6] text-xs text-[#9CA3AF] flex items-center justify-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-[#059669]" />
                                    All bookings on Hyve are secured with 100% Escrow Protection
                                </div>
                            </div>
                        )}

                        {/* CASE 3: ACTIVE APARTMENT LOADED - FULL 8 CAPABILITIES */}
                        {!isLoading && lease && property && (
                            <>
                                {/* TOP HERO STRIP: APARTMENT TITLE & PAYMENT STATUS */}
                                <div className="bg-white rounded-3xl border border-[#EAEAEA] p-6 sm:p-8 shadow-sm mb-8">
                                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                                        <div className="space-y-3">
                                            <div className="flex flex-wrap items-center gap-2.5">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${paymentStatus.color}`}>
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    {paymentStatus.label}
                                                </span>
                                                <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB]">
                                                    {lease.referenceNumber || `#HYV-LS-${property.id}`}
                                                </span>
                                            </div>

                                            <h1 className="text-2xl sm:text-3xl font-bold font-poppins text-[#1F2937] leading-tight">
                                                {property.lodgeDesc}
                                            </h1>

                                            {/* Full Address with Copy Button */}
                                            <div className="flex items-center gap-2 text-sm text-[#4B5563]">
                                                <MapPin className="w-4 h-4 text-primary shrink-0" />
                                                <span className="font-medium">{property.nearbyDistance || "Ojota, Lagos State, Nigeria"}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopy(property.nearbyDistance || "Ojota, Lagos State, Nigeria", "Apartment address copied!")}
                                                    className="p-1 rounded-md text-[#9CA3AF] hover:text-primary hover:bg-[#F3F4F6] smooth-transition"
                                                    title="Copy full address"
                                                >
                                                    <Copy className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Financial & Landlord Contact Bar */}
                                        <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
                                            <div className="text-left lg:text-right">
                                                <p className="text-xs text-[#6B7280]">Yearly Rent</p>
                                                <p className="text-xl sm:text-2xl font-extrabold text-primary">
                                                    ₦ {yearlyRent.toLocaleString()}
                                                    <span className="text-xs font-normal text-[#888888]"> / year</span>
                                                </p>
                                                {monthlyRent > 0 && (
                                                    <p className="text-xs text-[#6B7280]">
                                                        (₦ {monthlyRent.toLocaleString()} / month)
                                                    </p>
                                                )}
                                            </div>

                                            {/* Communication Action Chips */}
                                            <div className="flex items-center gap-2 pt-1">
                                                <a
                                                    href={`tel:${landlordPhone}`}
                                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#1F2937] bg-[#F9FAFB] hover:bg-[#F3F4F6] border border-[#D1D5DB] smooth-transition shadow-sm"
                                                    title="Call Landlord"
                                                >
                                                    <Phone className="w-3.5 h-3.5 text-primary" />
                                                    Call
                                                </a>
                                                <a
                                                    href={whatsappLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-[#25D366] hover:bg-[#1EBE5D] smooth-transition shadow-sm"
                                                    title="Chat on WhatsApp"
                                                >
                                                    <FaWhatsapp className="text-sm" />
                                                    WhatsApp
                                                </a>
                                                <button
                                                    type="button"
                                                    onClick={handleChatWithLandlord}
                                                    disabled={isOpeningChat}
                                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-primary-hover smooth-transition shadow-sm disabled:opacity-60"
                                                    title="In-App Messaging"
                                                >
                                                    <MessageSquare className="w-3.5 h-3.5" />
                                                    {isOpeningChat ? "Opening..." : "Chat"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Lease Timeline Strip */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#F3F4F6]">
                                        <div className="p-3 rounded-xl bg-[#F9FAFB] border border-[#EAEAEA]">
                                            <p className="text-[11px] text-[#6B7280] uppercase tracking-wider">Rent Start Date</p>
                                            <p className="text-xs sm:text-sm font-semibold text-[#1F2937] mt-1">{formattedMoveInDate}</p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-[#F9FAFB] border border-[#EAEAEA]">
                                            <p className="text-[11px] text-[#6B7280] uppercase tracking-wider">Rent End Date</p>
                                            <p className="text-xs sm:text-sm font-semibold text-[#1F2937] mt-1">{formattedExpiryDate}</p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-[#F9FAFB] border border-[#EAEAEA]">
                                            <p className="text-[11px] text-[#6B7280] uppercase tracking-wider">Time Remaining</p>
                                            <p className="text-xs sm:text-sm font-semibold text-primary mt-1">
                                                {isRentExpired ? "Expired" : `${daysRemaining} days`}
                                            </p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-[#F9FAFB] border border-[#EAEAEA]">
                                            <p className="text-[11px] text-[#6B7280] uppercase tracking-wider">Lease Progress</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="w-full h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${isRentExpired ? 'bg-[#DC2626]' : 'bg-primary'}`}
                                                        style={{ width: `${leaseProgress}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-semibold text-[#1F2937]">{leaseProgress}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* MODULAR SEGMENTED TAB BAR */}
                                <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-8 border-b border-[#EAEAEA] scrollbar-none">
                                    {[
                                        { id: 'overview', label: '1. Overview & Contacts', icon: Building2 },
                                        { id: 'documents', label: '2. Documents & Receipts', icon: FileText },
                                        { id: 'renewal', label: '3. Rent & Renewal', icon: RefreshCw },
                                        { id: 'moveout', label: '4. Move-Out & Notice', icon: Calendar },
                                        { id: 'rules', label: '5. Rules & Utilities', icon: Shield },
                                        { id: 'services', label: '6. Request Services', icon: Wrench },
                                        { id: 'reviews', label: '7. Reviews', icon: Star },
                                    ].map((tab) => {
                                        const Icon = tab.icon;
                                        const isActive = activeTab === tab.id;
                                        return (
                                            <button
                                                key={tab.id}
                                                type="button"
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap smooth-transition shrink-0 ${
                                                    isActive
                                                        ? 'bg-primary text-white shadow-sm'
                                                        : 'text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#1F2937]'
                                                }`}
                                            >
                                                <Icon className="w-4 h-4" />
                                                {tab.label}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* TAB 1: OVERVIEW & CONTACTS */}
                                {activeTab === 'overview' && (
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-300">
                                        {/* Gallery Card */}
                                        <div className="lg:col-span-6 bg-white rounded-2xl border border-[#EAEAEA] p-5 shadow-sm space-y-4">
                                            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#F3F4F6]">
                                                {activeImage ? (
                                                    <img src={activeImage} alt={property.lodgeDesc} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center text-[#9CA3AF]">
                                                        <Home className="w-12 h-12 mb-2 stroke-1" />
                                                        <span className="text-xs">No image uploaded</span>
                                                    </div>
                                                )}
                                                {property.propertyType && (
                                                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-full font-medium">
                                                        {property.propertyType}
                                                    </div>
                                                )}
                                            </div>

                                            {property.images && property.images.length > 1 && (
                                                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                                                    {property.images.map((img, idx) => (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            onClick={() => setSelectedImageIndex(idx)}
                                                            className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 ${
                                                                selectedImageIndex === idx ? 'border-primary ring-1 ring-primary' : 'border-transparent opacity-70 hover:opacity-100'
                                                            }`}
                                                        >
                                                            <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            <div>
                                                <h3 className="text-sm font-semibold text-[#1F2937] mb-1">About This Property</h3>
                                                <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
                                                    {property.description || "No description provided for this listing."}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Contacts & Caretaker Hub */}
                                        <div className="lg:col-span-6 space-y-6">
                                            <div className="bg-white rounded-2xl border border-[#EAEAEA] p-6 shadow-sm">
                                                <h3 className="text-base font-bold text-[#1F2937] mb-4">Landlord & Caretaker Contacts</h3>
                                                
                                                <div className="flex items-center gap-3.5 pb-5 border-b border-[#F3F4F6]">
                                                    <div className="w-14 h-14 rounded-full overflow-hidden border border-[#EAEAEA] bg-[#F3F4F6] shrink-0">
                                                        <img src={defaultProfile} alt={landlordName} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-1.5">
                                                            <h4 className="font-bold text-base text-[#1F2937]">{landlordName}</h4>
                                                            <ShieldCheck className="w-4 h-4 text-[#059669]" />
                                                        </div>
                                                        <p className="text-xs text-[#6B7280]">Primary Landlord & Property Manager</p>
                                                        <p className="text-xs font-mono text-[#1F2937] mt-0.5">{landlordPhone}</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
                                                    <a
                                                        href={`tel:${landlordPhone}`}
                                                        className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold text-[#1F2937] bg-[#F9FAFB] hover:bg-[#F3F4F6] border border-[#D1D5DB] smooth-transition"
                                                    >
                                                        <Phone className="w-4 h-4 text-primary" />
                                                        Direct Call
                                                    </a>
                                                    <a
                                                        href={whatsappLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold text-white bg-[#25D366] hover:bg-[#1EBE5D] smooth-transition"
                                                    >
                                                        <FaWhatsapp className="text-base" />
                                                        WhatsApp
                                                    </a>
                                                    <button
                                                        type="button"
                                                        onClick={handleChatWithLandlord}
                                                        className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-primary-hover smooth-transition"
                                                    >
                                                        <MessageSquare className="w-4 h-4" />
                                                        In-App Chat
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Specifications */}
                                            <div className="bg-white rounded-2xl border border-[#EAEAEA] p-6 shadow-sm">
                                                <h3 className="text-sm font-semibold text-[#1F2937] mb-3">Key Details</h3>
                                                <div className="grid grid-cols-2 gap-3 text-xs">
                                                    <div className="p-3 rounded-xl bg-[#F9FAFB] border border-[#EAEAEA]">
                                                        <p className="text-[#6B7280]">Status</p>
                                                        <p className="font-semibold text-[#059669] mt-0.5">Active Occupancy</p>
                                                    </div>
                                                    <div className="p-3 rounded-xl bg-[#F9FAFB] border border-[#EAEAEA]">
                                                        <p className="text-[#6B7280]">Tenancy Term</p>
                                                        <p className="font-semibold text-[#1F2937] mt-0.5">12 Months (Annual)</p>
                                                    </div>
                                                    <div className="p-3 rounded-xl bg-[#F9FAFB] border border-[#EAEAEA]">
                                                        <p className="text-[#6B7280]">Property Type</p>
                                                        <p className="font-semibold text-[#1F2937] mt-0.5">{property.propertyType || "Apartment"}</p>
                                                    </div>
                                                    <div className="p-3 rounded-xl bg-[#F9FAFB] border border-[#EAEAEA]">
                                                        <p className="text-[#6B7280]">Escrow Protection</p>
                                                        <p className="font-semibold text-[#059669] mt-0.5">100% Guaranteed</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 2: DOWNLOAD ESSENTIAL DOCUMENTS */}
                                {activeTab === 'documents' && (
                                    <div className="space-y-6 animate-in fade-in duration-300">
                                        <div className="bg-white rounded-2xl border border-[#EAEAEA] p-6 shadow-sm">
                                            <h3 className="text-base font-bold text-[#1F2937] mb-1">Official Tenancy Documents</h3>
                                            <p className="text-xs text-[#6B7280] mb-6">Signed legal agreements, escrow receipts, and inspection inventories</p>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {/* Document 1: Tenancy Agreement */}
                                                <div className="p-5 rounded-2xl border border-[#EAEAEA] bg-[#F9FAFB] flex flex-col justify-between space-y-4">
                                                    <div className="flex items-start justify-between">
                                                        <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-primary">
                                                            <FileText className="w-5 h-5" />
                                                        </div>
                                                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#ECFDF5] text-[#059669]">
                                                            Signed & Active
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-sm text-[#1F2937]">Tenancy Agreement</h4>
                                                        <p className="text-xs text-[#6B7280] mt-1">Official residential lease agreement between tenant and landlord.</p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setActiveModal('agreement')}
                                                        className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-primary-hover flex items-center justify-center gap-2 smooth-transition"
                                                    >
                                                        <Printer className="w-3.5 h-3.5" />
                                                        View / Download PDF
                                                    </button>
                                                </div>

                                                {/* Document 2: Rent Payment Receipt */}
                                                <div className="p-5 rounded-2xl border border-[#EAEAEA] bg-[#F9FAFB] flex flex-col justify-between space-y-4">
                                                    <div className="flex items-start justify-between">
                                                        <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-primary">
                                                            <CheckCheck className="w-5 h-5" />
                                                        </div>
                                                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#ECFDF5] text-[#059669]">
                                                            Escrow Cleared
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-sm text-[#1F2937]">Rent Payment Receipt</h4>
                                                        <p className="text-xs text-[#6B7280] mt-1">Proof of yearly rent payment with official Hyve transaction stamp.</p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setActiveModal('receipt')}
                                                        className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-primary-hover flex items-center justify-center gap-2 smooth-transition"
                                                    >
                                                        <Printer className="w-3.5 h-3.5" />
                                                        View / Print Receipt
                                                    </button>
                                                </div>

                                                {/* Document 3: Signed Inventory Report */}
                                                <div className="p-5 rounded-2xl border border-[#EAEAEA] bg-[#F9FAFB] flex flex-col justify-between space-y-4">
                                                    <div className="flex items-start justify-between">
                                                        <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-primary">
                                                            <ShieldCheck className="w-5 h-5" />
                                                        </div>
                                                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#F3F4F6] text-[#4B5563]">
                                                            Archived
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-sm text-[#1F2937]">Move-In Condition Report</h4>
                                                        <p className="text-xs text-[#6B7280] mt-1">Signed fixture inventory & keys checklist logged on move-in.</p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setActiveModal('inventory')}
                                                        className="w-full py-2.5 rounded-xl text-xs font-semibold text-[#374151] bg-white border border-[#D1D5DB] hover:bg-[#F3F4F6] flex items-center justify-center gap-2 smooth-transition"
                                                    >
                                                        <FileText className="w-3.5 h-3.5" />
                                                        View Signed Report
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 3: RENT RENEWAL & PAYMENT HISTORY */}
                                {activeTab === 'renewal' && (
                                    <div className="space-y-6 animate-in fade-in duration-300">
                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                                            {/* Renewal Action Card */}
                                            <div className="lg:col-span-6 bg-white rounded-2xl border border-[#EAEAEA] p-6 shadow-sm space-y-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-primary">
                                                        <RefreshCw className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-base text-[#1F2937]">Rent Renewal Gateway</h3>
                                                        <p className="text-xs text-[#6B7280]">Next renewal period: {formattedExpiryDate}</p>
                                                    </div>
                                                </div>

                                                <div className="p-4 rounded-xl bg-[#F9FAFB] border border-[#EAEAEA] space-y-2 text-xs">
                                                    <div className="flex justify-between">
                                                        <span className="text-[#6B7280]">Next Yearly Rent:</span>
                                                        <span className="font-bold text-[#1F2937]">₦ {yearlyRent.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-[#6B7280]">Current Expiration:</span>
                                                        <span className="font-semibold text-[#1F2937]">{formattedExpiryDate}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-[#6B7280]">Renewal Status:</span>
                                                        <span className={`font-semibold ${isRentExpired ? 'text-[#DC2626]' : 'text-[#059669]'}`}>
                                                            {isRentExpired ? 'Renewal Available Now' : 'Active (Locked until expiry)'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div>
                                                    {isRentExpired ? (
                                                        <Link
                                                            to={`/user/apartment/reserve/${property.id}`}
                                                            className="w-full py-3.5 px-4 text-white rounded-xl shadow-md bg-primary hover:bg-primary-hover smooth-transition text-sm text-center font-semibold flex items-center justify-center gap-2 block"
                                                        >
                                                            <RefreshCw className="w-4 h-4" />
                                                            Pay Next Rent Now (Renew)
                                                        </Link>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            disabled
                                                            className="w-full py-3.5 px-4 text-[#9CA3AF] bg-[#E5E7EB] border border-[#D1D5DB] rounded-xl cursor-not-allowed text-sm font-semibold shadow-none select-none flex items-center justify-center gap-2"
                                                        >
                                                            <Clock className="w-4 h-4 text-[#9CA3AF]" />
                                                            Renew Stay (Active)
                                                        </button>
                                                    )}
                                                    {!isRentExpired && (
                                                        <p className="text-xs text-center text-[#888888] mt-2">
                                                            Renewal unlocks when current rent expires on <span className="font-medium text-[#374151]">{formattedExpiryDate}</span>
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="pt-4 border-t border-[#F3F4F6] flex items-center justify-between">
                                                    <div className="text-xs">
                                                        <p className="font-semibold text-[#1F2937]">Automated Rent Reminders</p>
                                                        <p className="text-[#6B7280]">Get alerts 30, 14 & 7 days before expiry</p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setActiveModal('reminders')}
                                                        className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-[#D1D5DB] bg-white hover:bg-[#F9FAFB] text-[#374151] flex items-center gap-1.5 smooth-transition"
                                                    >
                                                        <Bell className="w-3.5 h-3.5 text-primary" />
                                                        Configure
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Payment Ledger / History */}
                                            <div className="lg:col-span-6 bg-white rounded-2xl border border-[#EAEAEA] p-6 shadow-sm space-y-4">
                                                <h3 className="text-base font-bold text-[#1F2937]">Payment History Ledger</h3>
                                                <p className="text-xs text-[#6B7280]">Verified transactions recorded under this tenancy</p>

                                                <div className="space-y-3">
                                                    <div className="p-3.5 rounded-xl bg-[#F9FAFB] border border-[#EAEAEA] flex items-center justify-between">
                                                        <div>
                                                            <p className="text-xs font-bold text-[#1F2937]">Initial 1-Year Rent Deposit</p>
                                                            <p className="text-[11px] text-[#6B7280]">{formattedMoveInDate} • Escrow Reference #{lease.id || 1}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-xs font-bold text-[#059669]">₦ {yearlyRent.toLocaleString()}</p>
                                                            <span className="text-[10px] px-2 py-0.5 rounded bg-[#ECFDF5] text-[#059669] font-medium">Cleared</span>
                                                        </div>
                                                    </div>

                                                    <div className="p-3.5 rounded-xl bg-[#F9FAFB] border border-[#EAEAEA] flex items-center justify-between">
                                                        <div>
                                                            <p className="text-xs font-bold text-[#1F2937]">Caution & Damage Deposit</p>
                                                            <p className="text-[11px] text-[#6B7280]">Held in Escrow Trust</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-xs font-bold text-[#1F2937]">₦ 50,000</p>
                                                            <span className="text-[10px] px-2 py-0.5 rounded bg-[#ECFDF5] text-[#059669] font-medium">Held Safely</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 4: MOVE-OUT NOTICE & CAUTION REFUND */}
                                {activeTab === 'moveout' && (
                                    <div className="space-y-6 animate-in fade-in duration-300">
                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                                            {/* Notice to Vacate Form */}
                                            <div className="lg:col-span-6 bg-white rounded-2xl border border-[#EAEAEA] p-6 shadow-sm space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-[#FEE2E2] flex items-center justify-center text-[#DC2626]">
                                                        <Calendar className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-base text-[#1F2937]">Give Notice to Vacate</h3>
                                                        <p className="text-xs text-[#6B7280]">Minimum 30-day notice required by tenancy agreement</p>
                                                    </div>
                                                </div>

                                                {noticeSubmitted ? (
                                                    <div className="p-4 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] space-y-2">
                                                        <div className="flex items-center gap-2 text-xs font-bold text-[#059669]">
                                                            <CheckCircle2 className="w-4 h-4" />
                                                            Notice Formally Logged
                                                        </div>
                                                        <p className="text-xs text-[#059669]">
                                                            Your move-out request for <span className="font-bold">{noticeDate}</span> is being processed. The property manager will reach out to confirm the handover date.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <form onSubmit={handleNoticeSubmit} className="space-y-3 pt-2">
                                                        <div>
                                                            <label className="block text-xs font-medium text-[#4B5563] mb-1">Planned Move-Out Date *</label>
                                                            <input
                                                                type="date"
                                                                required
                                                                value={noticeDate}
                                                                onChange={(e) => setNoticeDate(e.target.value)}
                                                                className="w-full px-3 py-2.5 rounded-xl border border-[#D1D5DB] text-xs text-[#1F2937] outline-none focus:border-primary"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-xs font-medium text-[#4B5563] mb-1">Reason for Moving</label>
                                                            <select
                                                                value={noticeReason}
                                                                onChange={(e) => setNoticeReason(e.target.value)}
                                                                className="w-full px-3 py-2.5 rounded-xl border border-[#D1D5DB] text-xs text-[#1F2937] outline-none focus:border-primary"
                                                            >
                                                                <option value="Relocation">Job / School Relocation</option>
                                                                <option value="Larger Space">Need Larger Apartment</option>
                                                                <option value="Purchased Property">Purchased Own Home</option>
                                                                <option value="Other">Other Reasons</option>
                                                            </select>
                                                        </div>

                                                        <div>
                                                            <label className="block text-xs font-medium text-[#4B5563] mb-1">Forwarding Bank Account (for Caution Fee)</label>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <input
                                                                    type="text"
                                                                    placeholder="Bank Name"
                                                                    value={forwardingBank}
                                                                    onChange={(e) => setForwardingBank(e.target.value)}
                                                                    className="px-3 py-2 rounded-xl border border-[#D1D5DB] text-xs text-[#1F2937] outline-none focus:border-primary"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    placeholder="Account Number"
                                                                    value={forwardingAccount}
                                                                    onChange={(e) => setForwardingAccount(e.target.value)}
                                                                    className="px-3 py-2 rounded-xl border border-[#D1D5DB] text-xs text-[#1F2937] outline-none focus:border-primary"
                                                                />
                                                            </div>
                                                        </div>

                                                        <button
                                                            type="submit"
                                                            disabled={isSubmittingNotice}
                                                            className="w-full py-3 rounded-xl text-xs font-semibold text-white bg-[#DC2626] hover:bg-[#B91C1C] smooth-transition shadow-sm disabled:opacity-50"
                                                        >
                                                            {isSubmittingNotice ? "Submitting..." : "Submit Notice to Vacate"}
                                                        </button>
                                                    </form>
                                                )}
                                            </div>

                                            {/* Caution Fee Refund Tracker */}
                                            <div className="lg:col-span-6 bg-white rounded-2xl border border-[#EAEAEA] p-6 shadow-sm space-y-5">
                                                <h3 className="text-base font-bold text-[#1F2937]">Caution Fee Refund Tracker</h3>
                                                <p className="text-xs text-[#6B7280]">Refund process for your ₦50,000 security deposit</p>

                                                <div className="space-y-4">
                                                    {[
                                                        { step: "1", title: "Notice Acknowledged", desc: noticeSubmitted ? "Confirmed by Landlord" : "Pending notice submission", completed: noticeSubmitted },
                                                        { step: "2", title: "Handover & Keys Return", desc: "Return keys to estate security/manager", completed: false },
                                                        { step: "3", title: "Final Physical Inspection", desc: "Utility bills & damage clearance checklist", completed: false },
                                                        { step: "4", title: "Escrow Refund Dispatched", desc: "Caution deposit wired to your bank account within 72 hours", completed: false },
                                                    ].map((item, i) => (
                                                        <div key={i} className="flex items-start gap-3">
                                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                                                item.completed ? 'bg-[#059669] text-white' : 'bg-[#E5E7EB] text-[#4B5563]'
                                                            }`}>
                                                                {item.completed ? <Check className="w-4 h-4" /> : item.step}
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-bold text-[#1F2937]">{item.title}</p>
                                                                <p className="text-[11px] text-[#6B7280]">{item.desc}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 5: APARTMENT RULES & UTILITIES INFO */}
                                {activeTab === 'rules' && (
                                    <div className="space-y-6 animate-in fade-in duration-300">
                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                                            {/* House Rules */}
                                            <div className="lg:col-span-6 bg-white rounded-2xl border border-[#EAEAEA] p-6 shadow-sm space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-primary">
                                                        <Shield className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-base text-[#1F2937]">House Rules & Estate Policies</h3>
                                                        <p className="text-xs text-[#6B7280]">Community standards for peaceful coexistence</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-3 text-xs">
                                                    <div className="p-3.5 rounded-xl bg-[#F9FAFB] border border-[#EAEAEA]">
                                                        <p className="font-bold text-[#1F2937]">🌙 Quiet Hours Policy</p>
                                                        <p className="text-[#6B7280] mt-0.5">Quiet hours are observed daily from 10:00 PM to 7:00 AM. Avoid loud music and disturbance.</p>
                                                    </div>
                                                    <div className="p-3.5 rounded-xl bg-[#F9FAFB] border border-[#EAEAEA]">
                                                        <p className="font-bold text-[#1F2937]">👥 Visitor & Guest Policy</p>
                                                        <p className="text-[#6B7280] mt-0.5">Overnight visitors staying over 3 consecutive days must be registered with the security post.</p>
                                                    </div>
                                                    <div className="p-3.5 rounded-xl bg-[#F9FAFB] border border-[#EAEAEA]">
                                                        <p className="font-bold text-[#1F2937]">🗑️ Waste Disposal Days</p>
                                                        <p className="text-[#6B7280] mt-0.5">Waste collection takes place on Tuesdays and Fridays. Bag all refuse securely in estate bins.</p>
                                                    </div>
                                                    <div className="p-3.5 rounded-xl bg-[#F9FAFB] border border-[#EAEAEA]">
                                                        <p className="font-bold text-[#1F2937]">🐾 Pet Policy</p>
                                                        <p className="text-[#6B7280] mt-0.5">Small domesticated pets permitted with written consent and vaccination records.</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Utility Information & Emergency Contacts */}
                                            <div className="lg:col-span-6 space-y-6">
                                                {/* Utilities Card */}
                                                <div className="bg-white rounded-2xl border border-[#EAEAEA] p-6 shadow-sm space-y-4">
                                                    <h3 className="text-base font-bold text-[#1F2937]">Utility Information</h3>
                                                    
                                                    <div className="p-4 rounded-xl bg-[#FFF9F5] border border-[#FFE7DB] flex items-center justify-between">
                                                        <div>
                                                            <p className="text-[11px] font-bold text-primary uppercase">Prepaid Electricity Meter</p>
                                                            <p className="text-base font-mono font-bold text-[#1F2937] mt-0.5">0412-8821-9943</p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                handleCopy("0412-8821-9943", "Prepaid meter number copied!");
                                                                setCopiedMeter(true);
                                                                setTimeout(() => setCopiedMeter(false), 2000);
                                                            }}
                                                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-primary border border-primary/20 shadow-sm hover:bg-primary hover:text-white smooth-transition"
                                                        >
                                                            {copiedMeter ? "Copied!" : "Copy Meter #"}
                                                        </button>
                                                    </div>

                                                    <div className="space-y-2.5 text-xs">
                                                        <div className="flex justify-between p-3 rounded-lg bg-[#F9FAFB] border border-[#EAEAEA]">
                                                            <span className="text-[#6B7280]">💧 Water Pumping Hours:</span>
                                                            <span className="font-semibold text-[#1F2937]">6:00 AM – 8:00 AM & 6:00 PM – 8:00 PM</span>
                                                        </div>
                                                        <div className="flex justify-between p-3 rounded-lg bg-[#F9FAFB] border border-[#EAEAEA]">
                                                            <span className="text-[#6B7280]">⚡ Central Generator:</span>
                                                            <span className="font-semibold text-[#1F2937]">7:00 PM – 7:00 AM (during power outages)</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Emergency Contacts */}
                                                <div className="bg-white rounded-2xl border border-[#EAEAEA] p-6 shadow-sm space-y-3">
                                                    <h3 className="text-base font-bold text-[#1F2937]">Emergency Facility Contacts</h3>
                                                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                                                        <div className="p-3 rounded-xl bg-[#F9FAFB] border border-[#EAEAEA]">
                                                            <p className="text-[#6B7280]">Estate Security Post</p>
                                                            <a href="tel:+2348011112222" className="font-bold text-primary block mt-0.5">+234 801 111 2222</a>
                                                        </div>
                                                        <div className="p-3 rounded-xl bg-[#F9FAFB] border border-[#EAEAEA]">
                                                            <p className="text-[#6B7280]">Resident Electrician</p>
                                                            <a href="tel:+2348033334444" className="font-bold text-primary block mt-0.5">+234 803 333 4444</a>
                                                        </div>
                                                        <div className="p-3 rounded-xl bg-[#F9FAFB] border border-[#EAEAEA]">
                                                            <p className="text-[#6B7280]">Estate Facility Manager</p>
                                                            <a href="tel:+2348055556666" className="font-bold text-primary block mt-0.5">+234 805 555 6666</a>
                                                        </div>
                                                        <div className="p-3 rounded-xl bg-[#F9FAFB] border border-[#EAEAEA]">
                                                            <p className="text-[#6B7280]">Emergency Hotline</p>
                                                            <a href="tel:112" className="font-bold text-[#DC2626] block mt-0.5">112 (Police & Fire)</a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 6: REQUEST SERVICES (PHASE 2 ANCILLARY SERVICES) */}
                                {activeTab === 'services' && (
                                    <div className="space-y-6 animate-in fade-in duration-300">
                                        <div className="bg-white rounded-2xl border border-[#EAEAEA] p-6 shadow-sm">
                                            <div className="flex items-center justify-between mb-6">
                                                <div>
                                                    <h3 className="text-base font-bold text-[#1F2937]">Hyve Ancillary Services</h3>
                                                    <p className="text-xs text-[#6B7280]">Vetted professional facility services for your apartment</p>
                                                </div>
                                                <span className="text-xs font-semibold px-2.5 py-1 rounded bg-[#FFF9F5] text-primary border border-[#FFE7DB]">
                                                    Fast 24-hr Response
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                                {/* Service 1: Cleaning */}
                                                <div className="p-5 rounded-2xl border border-[#EAEAEA] bg-[#F9FAFB] flex flex-col justify-between space-y-4">
                                                    <div>
                                                        <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-primary mb-3">
                                                            <Sparkles className="w-5 h-5" />
                                                        </div>
                                                        <h4 className="font-bold text-sm text-[#1F2937]">Professional Cleaning</h4>
                                                        <p className="text-xs text-[#6B7280] mt-1">Deep cleaning, carpet shampooing, window washing, and routine tidy-up.</p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setServiceType('Professional Cleaning');
                                                            setActiveModal('service');
                                                        }}
                                                        className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-primary-hover smooth-transition"
                                                    >
                                                        Request Cleaning
                                                    </button>
                                                </div>

                                                {/* Service 2: Repairs & Maintenance */}
                                                <div className="p-5 rounded-2xl border border-[#EAEAEA] bg-[#F9FAFB] flex flex-col justify-between space-y-4">
                                                    <div>
                                                        <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-primary mb-3">
                                                            <Wrench className="w-5 h-5" />
                                                        </div>
                                                        <h4 className="font-bold text-sm text-[#1F2937]">Repairs & Maintenance</h4>
                                                        <p className="text-xs text-[#6B7280] mt-1">Fix plumbing leaks, electrical wiring, AC servicing, and carpentry.</p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setServiceType('Repairs & Maintenance');
                                                            setActiveModal('service');
                                                        }}
                                                        className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-primary-hover smooth-transition"
                                                    >
                                                        Request Repairs
                                                    </button>
                                                </div>

                                                {/* Service 3: Moving Assistance */}
                                                <div className="p-5 rounded-2xl border border-[#EAEAEA] bg-[#F9FAFB] flex flex-col justify-between space-y-4">
                                                    <div>
                                                        <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-primary mb-3">
                                                            <Truck className="w-5 h-5" />
                                                        </div>
                                                        <h4 className="font-bold text-sm text-[#1F2937]">Moving & Hauling Assistance</h4>
                                                        <p className="text-xs text-[#6B7280] mt-1">Vetted moving vans, packing boxes, and porter loading assistance.</p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setServiceType('Moving Assistance');
                                                            setActiveModal('service');
                                                        }}
                                                        className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-primary-hover smooth-transition"
                                                    >
                                                        Request Moving Help
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 7: LEAVE A REVIEW */}
                                {activeTab === 'reviews' && (
                                    <div className="space-y-6 animate-in fade-in duration-300">
                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                                            {/* Review Form */}
                                            <div className="lg:col-span-7 bg-white rounded-2xl border border-[#EAEAEA] p-6 shadow-sm space-y-4">
                                                <div>
                                                    <h3 className="text-base font-bold text-[#1F2937]">Rate Your Tenancy Experience</h3>
                                                    <p className="text-xs text-[#6B7280]">Share feedback on the apartment, landlord conduct, and estate environment</p>
                                                </div>

                                                <form onSubmit={handleReviewSubmit} className="space-y-4">
                                                    <div>
                                                        <label className="block text-xs font-medium text-[#4B5563] mb-1">What are you rating? *</label>
                                                        <select
                                                            value={reviewCategory}
                                                            onChange={(e) => setReviewCategory(e.target.value)}
                                                            className="w-full px-3 py-2.5 rounded-xl border border-[#D1D5DB] text-xs text-[#1F2937] outline-none focus:border-primary"
                                                        >
                                                            <option value="Apartment">Apartment Condition & Fixtures</option>
                                                            <option value="Landlord">Landlord & Caretaker Responsiveness</option>
                                                            <option value="Estate">Estate Security & Electricity</option>
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-medium text-[#4B5563] mb-1">Overall Star Rating *</label>
                                                        <select
                                                            value={rating}
                                                            onChange={(e) => setRating(e.target.value)}
                                                            className="w-full px-3 py-2.5 rounded-xl border border-[#D1D5DB] text-xs text-[#1F2937] outline-none focus:border-primary"
                                                        >
                                                            <option value="">Select star rating (1 - 5 stars)</option>
                                                            <option value="5">★★★★★ 5 - Exceptional Living Experience</option>
                                                            <option value="4">★★★★☆ 4 - Great Experience</option>
                                                            <option value="3">★★★☆☆ 3 - Satisfactory</option>
                                                            <option value="2">★★☆☆☆ 2 - Below Expectations</option>
                                                            <option value="1">★☆☆☆☆ 1 - Poor / Issues Faced</option>
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-medium text-[#4B5563] mb-1">Comments & Living Feedback</label>
                                                        <textarea
                                                            rows={4}
                                                            maxLength={400}
                                                            placeholder="Share details regarding the amenities, water supply, landlord responsiveness, and overall stay..."
                                                            value={reviewText}
                                                            onChange={(e) => setReviewText(e.target.value)}
                                                            className="w-full px-3 py-2.5 rounded-xl border border-[#D1D5DB] text-xs sm:text-sm text-[#1F2937] outline-none focus:border-primary resize-none"
                                                        />
                                                    </div>

                                                    <button
                                                        type="submit"
                                                        disabled={isSubmittingReview}
                                                        className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-primary hover:bg-primary-hover shadow-sm smooth-transition disabled:opacity-60"
                                                    >
                                                        {isSubmittingReview ? "Submitting..." : "Post Review"}
                                                    </button>
                                                </form>
                                            </div>

                                            {/* Existing Reviews Summary */}
                                            <div className="lg:col-span-5 bg-white rounded-2xl border border-[#EAEAEA] p-6 shadow-sm space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-base font-bold text-[#1F2937]">Community Ratings</h3>
                                                    <div className="flex items-center gap-1 text-sm font-bold text-amber-500 bg-[#FEF3C7] px-2.5 py-1 rounded-lg">
                                                        <Star className="w-4 h-4 fill-amber-500" />
                                                        {property.starRating}
                                                    </div>
                                                </div>

                                                {property.reviews && property.reviews.length > 0 ? (
                                                    <div className="space-y-3">
                                                        {property.reviews.slice(0, 3).map((r) => (
                                                            <div key={r.id} className="p-3 rounded-xl bg-[#F9FAFB] border border-[#EAEAEA] text-xs space-y-1">
                                                                <div className="flex justify-between font-semibold text-[#1F2937]">
                                                                    <span>{r.author}</span>
                                                                    <span className="text-amber-500">★ {r.rating}</span>
                                                                </div>
                                                                <p className="text-[#4B5563]">{r.review}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-[#6B7280] py-6 text-center">
                                                        Be the first tenant to leave a verified review for this apartment!
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                    </div>
                </main>
            </div>

            {/* Mobile Navigation */}
            <MobileNavigationTab />

            {/* MODAL: OFFICIAL TENANCY AGREEMENT */}
            {activeModal === 'agreement' && property && lease && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#EAEAEA] relative animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                        <button
                            type="button"
                            onClick={() => setActiveModal(null)}
                            className="absolute top-4 right-4 p-1.5 rounded-full text-[#9CA3AF] hover:text-[#1F2937] hover:bg-[#F3F4F6] print:hidden"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center pb-5 border-b border-[#EAEAEA]">
                            <span className="text-[11px] font-bold tracking-widest uppercase text-primary">HYVE HAVEN RESIDENTIAL LEASING</span>
                            <h2 className="text-lg sm:text-xl font-bold font-poppins text-[#1F2937] mt-1">Residential Tenancy Agreement</h2>
                            <p className="text-xs text-[#6B7280] mt-0.5">Agreement Reference: {lease.referenceNumber || `#HYV-LS-${property.id}`}</p>
                        </div>

                        <div className="py-5 space-y-4 text-xs text-[#4B5563] leading-relaxed">
                            <p>
                                <strong>THIS RESIDENTIAL TENANCY AGREEMENT</strong> is entered between <strong>{landlordName}</strong> (the "Landlord") and the registered tenant (the "Tenant") for the premises located at <strong>{property.nearbyDistance || "Ojota, Lagos"}</strong> known as <strong>{property.lodgeDesc}</strong>.
                            </p>

                            <div className="p-3.5 rounded-xl bg-[#F9FAFB] border border-[#EAEAEA] space-y-1.5">
                                <p><strong>1. Lease Term:</strong> 12 Months commencing on {formattedMoveInDate} and ending on {formattedExpiryDate}.</p>
                                <p><strong>2. Yearly Rent:</strong> ₦ {yearlyRent.toLocaleString()} payable annually in advance via Hyve Escrow.</p>
                                <p><strong>3. Use of Premises:</strong> Strictly for private residential accommodation.</p>
                                <p><strong>4. Caution Deposit:</strong> ₦ 50,000 held in escrow trust, refundable upon vacating in clean condition.</p>
                            </div>

                            <p>
                                Both parties agree to abide by the standard estate covenants and quiet hours.
                            </p>

                            <div className="pt-4 border-t border-[#F3F4F6] flex justify-between items-end text-xs">
                                <div>
                                    <p className="font-semibold text-[#1F2937]">Digital Verification Seal</p>
                                    <p className="text-[11px] text-[#059669]">✓ Verified by Hyve Real Estate Trust</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-[#1F2937]">{landlordName}</p>
                                    <p className="text-[11px] text-[#6B7280]">Landlord Signature on File</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EAEAEA] print:hidden">
                            <button
                                type="button"
                                onClick={() => setActiveModal(null)}
                                className="px-4 py-2 text-xs font-semibold text-[#4B5563] hover:bg-[#F3F4F6] rounded-xl"
                            >
                                Close
                            </button>
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-sm"
                            >
                                <Printer className="w-4 h-4" />
                                Print / Save PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: OFFICIAL PAYMENT RECEIPT */}
            {activeModal === 'receipt' && property && lease && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#EAEAEA] relative animate-in fade-in zoom-in duration-200">
                        <button
                            type="button"
                            onClick={() => setActiveModal(null)}
                            className="absolute top-4 right-4 p-1.5 rounded-full text-[#9CA3AF] hover:text-[#1F2937] hover:bg-[#F3F4F6] print:hidden"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center pb-5 border-b border-[#EAEAEA]">
                            <span className="text-[11px] font-bold tracking-widest uppercase text-primary">HYVE HAVEN ESCROW PAYMENT RECEIPT</span>
                            <h2 className="text-lg font-bold font-poppins text-[#1F2937] mt-1">Official Rent Payment Receipt</h2>
                            <p className="text-xs text-[#059669] font-medium mt-0.5">✓ 100% Escrow Verified & Cleared</p>
                        </div>

                        <div className="py-5 space-y-3 text-xs">
                            <div className="flex justify-between pb-2 border-b border-[#F3F4F6]">
                                <span className="text-[#6B7280]">Receipt Number:</span>
                                <span className="font-mono font-semibold text-[#1F2937]">#REC-{lease.id || 1}-2025</span>
                            </div>
                            <div className="flex justify-between pb-2 border-b border-[#F3F4F6]">
                                <span className="text-[#6B7280]">Property:</span>
                                <span className="font-semibold text-[#1F2937] text-right">{property.lodgeDesc}</span>
                            </div>
                            <div className="flex justify-between pb-2 border-b border-[#F3F4F6]">
                                <span className="text-[#6B7280]">Rent Period:</span>
                                <span className="font-medium text-[#1F2937]">{formattedMoveInDate} – {formattedExpiryDate}</span>
                            </div>
                            <div className="flex justify-between pb-2 border-b border-[#F3F4F6]">
                                <span className="text-[#6B7280]">Yearly Rent Paid:</span>
                                <span className="font-bold text-primary">₦ {yearlyRent.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between pb-2 border-b border-[#F3F4F6]">
                                <span className="text-[#6B7280]">Caution Deposit:</span>
                                <span className="font-semibold text-[#1F2937]">₦ 50,000 (Escrow)</span>
                            </div>
                            <div className="p-3 rounded-xl bg-[#ECFDF5] text-xs text-[#059669] border border-[#A7F3D0]">
                                Payment safely escrowed and credited to property management account.
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EAEAEA] print:hidden">
                            <button
                                type="button"
                                onClick={() => setActiveModal(null)}
                                className="px-4 py-2 text-xs font-semibold text-[#4B5563] hover:bg-[#F3F4F6] rounded-xl"
                            >
                                Close
                            </button>
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-sm"
                            >
                                <Printer className="w-4 h-4" />
                                Print Receipt
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: SIGNED INVENTORY REPORT */}
            {activeModal === 'inventory' && property && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#EAEAEA] relative animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                        <button
                            type="button"
                            onClick={() => setActiveModal(null)}
                            className="absolute top-4 right-4 p-1.5 rounded-full text-[#9CA3AF] hover:text-[#1F2937] hover:bg-[#F3F4F6] print:hidden"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center pb-5 border-b border-[#EAEAEA]">
                            <h2 className="text-base font-bold font-poppins text-[#1F2937]">Move-In Condition & Inventory Checklist</h2>
                            <p className="text-xs text-[#6B7280] mt-0.5">Signed upon keys handover on {formattedMoveInDate}</p>
                        </div>

                        <div className="py-4 space-y-2.5 text-xs text-[#4B5563]">
                            {[
                                { item: "Entrance & Security Door Lock", status: "Functional & 2 Keys Issued" },
                                { item: "Windows & Wire Gauze", status: "Good Condition, no tears" },
                                { item: "Prepaid Meter & Distribution Board", status: "Tested & Working" },
                                { item: "Bathroom Plumbing & Water Heater", status: "Clean, no leaks" },
                                { item: "Kitchen Sink & Cabinets", status: "Good Condition" },
                            ].map((row, i) => (
                                <div key={i} className="flex justify-between p-2.5 rounded-lg bg-[#F9FAFB] border border-[#EAEAEA]">
                                    <span className="font-medium text-[#1F2937]">{row.item}</span>
                                    <span className="text-[#059669] font-semibold">{row.status}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EAEAEA] print:hidden">
                            <button
                                type="button"
                                onClick={() => setActiveModal(null)}
                                className="px-4 py-2 text-xs font-semibold text-[#4B5563] hover:bg-[#F3F4F6] rounded-xl"
                            >
                                Close
                            </button>
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-sm"
                            >
                                Print Report
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: ANCILLARY SERVICE REQUEST */}
            {activeModal === 'service' && property && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#EAEAEA] relative animate-in fade-in zoom-in duration-200">
                        <button
                            type="button"
                            onClick={() => setActiveModal(null)}
                            className="absolute top-4 right-4 p-1.5 rounded-full text-[#9CA3AF] hover:text-[#1F2937] hover:bg-[#F3F4F6]"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-primary">
                                <Wrench className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-base text-[#1F2937]">Request {serviceType}</h3>
                                <p className="text-xs text-[#6B7280]">Hyve verified home care & maintenance</p>
                            </div>
                        </div>

                        <form onSubmit={handleServiceSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-[#4B5563] mb-1">Service Type</label>
                                <input
                                    type="text"
                                    disabled
                                    value={serviceType}
                                    className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] text-xs font-semibold text-[#1F2937]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[#4B5563] mb-1">Describe Required Work *</label>
                                <textarea
                                    rows={3}
                                    required
                                    placeholder="Provide specific details (e.g., tap leaking in master bathroom, AC needing gas refill, deep cleaning schedule)..."
                                    value={serviceDesc}
                                    onChange={(e) => setServiceDesc(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-[#D1D5DB] text-xs text-[#1F2937] outline-none focus:border-primary resize-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setActiveModal(null)}
                                    className="px-4 py-2 text-xs font-semibold text-[#4B5563] hover:bg-[#F3F4F6] rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingService}
                                    className="px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-sm disabled:opacity-50"
                                >
                                    {isSubmittingService ? "Dispatching..." : "Submit Request"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: CONFIGURE RENT REMINDERS */}
            {activeModal === 'reminders' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#EAEAEA] relative animate-in fade-in zoom-in duration-200">
                        <button
                            type="button"
                            onClick={() => setActiveModal(null)}
                            className="absolute top-4 right-4 p-1.5 rounded-full text-[#9CA3AF] hover:text-[#1F2937] hover:bg-[#F3F4F6]"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-primary">
                                <Bell className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-base text-[#1F2937]">Rent Renewal Reminders</h3>
                                <p className="text-xs text-[#6B7280]">Stay ahead of your upcoming lease expiration</p>
                            </div>
                        </div>

                        <form onSubmit={handleSaveReminders} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-medium text-[#4B5563] mb-1">Notify me before expiry:</label>
                                <select
                                    value={reminderDays}
                                    onChange={(e) => setReminderDays(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-[#D1D5DB] text-[#1F2937] outline-none focus:border-primary"
                                >
                                    <option value="60">60 Days in Advance</option>
                                    <option value="30">30 Days in Advance (Recommended)</option>
                                    <option value="14">14 Days in Advance</option>
                                    <option value="7">7 Days in Advance</option>
                                </select>
                            </div>

                            <div className="space-y-2 pt-2 border-t border-[#F3F4F6]">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={reminderWhatsApp}
                                        onChange={(e) => setReminderWhatsApp(e.target.checked)}
                                        className="w-4 h-4 accent-primary"
                                    />
                                    <span className="text-[#1F2937] font-medium">WhatsApp Notifications</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={reminderSms}
                                        onChange={(e) => setReminderSms(e.target.checked)}
                                        className="w-4 h-4 accent-primary"
                                    />
                                    <span className="text-[#1F2937] font-medium">SMS Text Alerts</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={reminderEmail}
                                        onChange={(e) => setReminderEmail(e.target.checked)}
                                        className="w-4 h-4 accent-primary"
                                    />
                                    <span className="text-[#1F2937] font-medium">Email Reminders</span>
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F3F4F6]">
                                <button
                                    type="button"
                                    onClick={() => setActiveModal(null)}
                                    className="px-4 py-2 font-semibold text-[#4B5563] hover:bg-[#F3F4F6] rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-sm"
                                >
                                    Save Preferences
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageApartment;
