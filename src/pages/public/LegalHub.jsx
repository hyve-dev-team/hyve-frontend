import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
    Shield,
    FileText,
    Lock,
    Scale,
    Building2,
    Cookie,
    AlertTriangle,
    Printer,
    Share2,
    CheckCircle2,
    Search,
    ChevronRight,
    ArrowLeft,
    ExternalLink,
    HelpCircle,
    Info
} from 'lucide-react';
import { hyveSuccess } from '../../utils/hyveToast';
import hyveLogo from '../../assets/svg/logo/hyve-logo.svg';
import Footer from '../../components/layout/Footer';

const POLICIES = [
    {
        id: 'privacy',
        title: 'Data Protection & Privacy Policy',
        shortTitle: 'Privacy Policy (NDPR)',
        subtitle: 'Nigeria Data Protection Regulation (NDPR) & NDPA 2023 Compliant',
        badge: 'NDPR / NDPA 2023',
        icon: Lock,
        effectiveDate: 'April 2026',
        summary: 'How HYVE Haven Limited collects, protects, processes, and respects your personal identity and financial data under Nigerian law.',
    },
    {
        id: 'terms',
        title: 'Platform Terms of Service',
        shortTitle: 'Terms of Service',
        subtitle: 'General platform covenants, account rules, and escrow terms',
        badge: 'General Terms',
        icon: Scale,
        effectiveDate: 'April 2026',
        summary: 'Governing the relationship between all users and HYVE Haven Limited, including verified accounts, escrow protections, and dispute boundaries.',
    },
    {
        id: 'caution-fee',
        title: 'Caution Fee Holding & Return Policy',
        shortTitle: 'Caution Fee Policy',
        subtitle: 'Collection, documentation, and mandatory 14-day return rules',
        badge: 'Deposit Protection',
        icon: Shield,
        effectiveDate: 'April 2026',
        summary: 'Rules governing security deposits, direct landlord holding, documented deduction proof, and tenant dispute escalation.',
    },
    {
        id: 'landlord-agreement',
        title: 'Landlord Partnership Agreement',
        shortTitle: 'Landlord Partnership',
        subtitle: '5% commission, 48-hour escrow payout, and verified queue covenants',
        badge: 'Landlord Terms',
        icon: Building2,
        effectiveDate: 'April 2026',
        summary: 'Binding terms for property owners listing on HYVE, including fee structures, payout schedules, and queue exclusivity.',
    },
    {
        id: 'tenancy-agreement',
        title: 'Standard Tenancy Agreement Template',
        shortTitle: 'Tenancy Agreement',
        subtitle: 'Standard residential covenants, repair liabilities, and quiet hours',
        badge: 'Residential Lease',
        icon: FileText,
        effectiveDate: 'April 2026',
        summary: 'The standard 12-month residential tenancy covenant framework applied between verified landlords and tenants.',
    },
    {
        id: 'acceptable-use',
        title: 'Acceptable Use Policy (AUP)',
        shortTitle: 'Acceptable Use',
        subtitle: 'Standards for platform conduct — Safety, Dignity, and Trust',
        badge: 'Community Standards',
        icon: AlertTriangle,
        effectiveDate: 'April 2026',
        summary: 'Standards of conduct expected of all users, prohibited activities, ghost listing prohibitions, and enforcement actions.',
    },
    {
        id: 'cookies',
        title: 'Cookie & Tracking Technologies Policy',
        shortTitle: 'Cookie Policy',
        subtitle: 'Session authentication, functional storage, and analytics choices',
        badge: 'Transparency',
        icon: Cookie,
        effectiveDate: 'April 2026',
        summary: 'Transparent details on how HYVE uses session cookies, local storage, and anonymous performance telemetry.',
    },
];

const LegalHub = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const policyParam = searchParams.get('policy') || 'privacy';

    const [activePolicyId, setActivePolicyId] = useState(policyParam);
    const [searchQuery, setSearchQuery] = useState('');
    const [hasCopied, setHasCopied] = useState(false);

    // Synchronize active policy with URL search parameters
    useEffect(() => {
        if (policyParam && POLICIES.some(p => p.id === policyParam)) {
            setActivePolicyId(policyParam);
        }
    }, [policyParam]);

    const handleSelectPolicy = (id) => {
        setActivePolicyId(id);
        setSearchParams({ policy: id });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCopyShareLink = () => {
        const url = `${window.location.origin}/legal?policy=${activePolicyId}`;
        navigator.clipboard.writeText(url);
        setHasCopied(true);
        hyveSuccess('Link Copied!', 'Policy link copied to clipboard.');
        setTimeout(() => setHasCopied(false), 2500);
    };

    const currentPolicy = useMemo(() => {
        return POLICIES.find(p => p.id === activePolicyId) || POLICIES[0];
    }, [activePolicyId]);

    return (
        <div className="min-h-screen bg-[#FDFBF9] text-[#1F2937] font-sora flex flex-col">
            {/* TOP BRAND HEADER */}
            <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#EAEAEA]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="flex items-center gap-2 group">
                            <img src={hyveLogo} alt="HYVE Haven" className="h-8 w-auto" />
                        </Link>
                        <span className="hidden sm:inline-block h-5 w-px bg-gray-200" />
                        <div className="hidden sm:flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary-light px-2.5 py-1 rounded-full border border-primary/20">
                                Legal & Trust Center
                            </span>
                            <span className="text-[11px] font-mono text-gray-500">
                                RC 9000322
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={handleCopyShareLink}
                            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#4B5563] bg-[#F9FAFB] hover:bg-[#F3F4F6] border border-[#EAEAEA] smooth-transition"
                            title="Copy link to this policy"
                        >
                            <Share2 className="w-3.5 h-3.5 text-primary" />
                            {hasCopied ? 'Link Copied' : 'Share'}
                        </button>
                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#4B5563] bg-[#F9FAFB] hover:bg-[#F3F4F6] border border-[#EAEAEA] smooth-transition"
                            title="Print this policy"
                        >
                            <Printer className="w-3.5 h-3.5 text-primary" />
                            Print
                        </button>
                        <Link
                            to="/"
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-primary-hover shadow-sm smooth-transition"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span className="hidden xs:inline">Back to Home</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* HERO BANNER */}
            <section className="bg-white border-b border-[#EAEAEA] py-10 sm:py-14">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl">
                        <div className="flex items-center gap-2 text-xs font-medium text-[#6B7280] mb-3">
                            <Link to="/" className="hover:text-primary smooth-transition">Home</Link>
                            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-primary font-semibold">Legal & Policy Hub</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1F2937] tracking-tight font-poppins">
                            Transparency, Security & Legal Compliance
                        </h1>
                        <p className="mt-3 text-sm sm:text-base text-[#4B5563] leading-relaxed">
                            HYVE Haven Limited is committed to upholding the highest standards of trust, tenant safety, and regulatory compliance under the laws of the Federal Republic of Nigeria.
                        </p>

                        {/* Search Filter Input */}
                        <div className="mt-6 relative max-w-lg">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search policy terms, clauses, or covenants..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D1D5DB] text-xs sm:text-sm bg-white outline-none focus:border-primary shadow-xs transition"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* MAIN CONTENT AREA */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* LEFT SIDEBAR NAVIGATION */}
                    <aside className="lg:col-span-4 space-y-4 lg:sticky lg:top-28">
                        <div className="bg-white rounded-2xl border border-[#EAEAEA] p-3 shadow-xs">
                            <p className="px-3 pt-2 pb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                                Policies & Agreements ({POLICIES.length})
                            </p>
                            <nav className="space-y-1">
                                {POLICIES.map((p) => {
                                    const Icon = p.icon;
                                    const isActive = p.id === activePolicyId;
                                    return (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => handleSelectPolicy(p.id)}
                                            className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 cursor-pointer ${
                                                isActive
                                                    ? 'bg-primary text-white shadow-sm font-semibold'
                                                    : 'text-[#4B5563] hover:bg-[#F9FAFB] hover:text-[#1F2937]'
                                            }`}
                                        >
                                            <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${isActive ? 'text-white' : 'text-primary'}`} />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-1">
                                                    <span className="text-xs sm:text-sm truncate">{p.shortTitle}</span>
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 font-medium ${
                                                        isActive ? 'bg-white/20 text-white' : 'bg-[#F3F4F6] text-gray-600'
                                                    }`}>
                                                        {p.badge}
                                                    </span>
                                                </div>
                                                <p className={`text-[11px] truncate mt-0.5 ${isActive ? 'text-white/80' : 'text-gray-400'}`}>
                                                    {p.subtitle}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* CORPORATE DISCLOSURE CARD */}
                        <div className="bg-[#FFF9F5] rounded-2xl border border-[#FFE7DB] p-5 text-xs text-[#4B5563] space-y-2.5">
                            <div className="flex items-center gap-2 text-primary font-bold">
                                <CheckCircle2 className="w-4 h-4 shrink-0" />
                                <span>Verified Corporate Entity</span>
                            </div>
                            <p className="leading-relaxed">
                                <strong>HYVE Haven Limited</strong> is a duly incorporated private company under the Companies and Allied Matters Act (CAMA) of the Federal Republic of Nigeria.
                            </p>
                            <div className="pt-2 border-t border-[#FFE7DB] text-[11px] space-y-1">
                                <p><strong>RC Number:</strong> RC 9000322</p>
                                <p><strong>Registered Address:</strong> 02, Adebola Crescent, Temidire Estate, Alagbole, Lagos State, Nigeria</p>
                                <p><strong>Data Officer:</strong> <a href="mailto:pcosedeme@gmail.com" className="text-primary hover:underline">pcosedeme@gmail.com</a></p>
                            </div>
                        </div>
                    </aside>

                    {/* RIGHT CONTENT DISPLAY */}
                    <div className="lg:col-span-8 bg-white rounded-3xl border border-[#EAEAEA] p-6 sm:p-10 shadow-sm space-y-8">
                        {/* Policy Title Banner */}
                        <div className="border-b border-[#F3F4F6] pb-6 space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-bold text-primary bg-primary-light px-3 py-1 rounded-full border border-primary/20">
                                    {currentPolicy.badge}
                                </span>
                                <span className="text-xs text-gray-500 font-medium">
                                    Effective Date: {currentPolicy.effectiveDate}
                                </span>
                                <span className="text-xs text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200">
                                    ✓ Active & Legally Enforceable
                                </span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] font-poppins">
                                {currentPolicy.title}
                            </h2>
                            <p className="text-sm text-[#4B5563] leading-relaxed">
                                {currentPolicy.summary}
                            </p>
                        </div>

                        {/* RENDER SPECIFIC POLICY CONTENT */}
                        <article className="prose prose-stone max-w-none text-xs sm:text-sm text-[#374151] leading-relaxed space-y-6">
                            {/* POLICY 1: DATA PROTECTION & PRIVACY POLICY (NDPR) */}
                            {activePolicyId === 'privacy' && (
                                <div className="space-y-6">
                                    <div className="p-4 rounded-xl bg-[#F9FAFB] border border-[#EAEAEA]">
                                        <p className="font-semibold text-primary">Nigeria Data Protection Regulation (NDPR) & NDPA 2023 Statement</p>
                                        <p className="text-gray-600 mt-1">
                                            HYVE Haven Limited is committed to protecting your personal data in strict compliance with the Nigeria Data Protection Regulation (NDPR) 2019 and the Nigeria Data Protection Act (NDPA) 2023. This policy describes how we collect, handle, and safeguard your data.
                                        </p>
                                    </div>

                                    <section className="space-y-2">
                                        <h3 className="text-base font-bold text-[#1F2937]">1. Identity of the Data Controller</h3>
                                        <p>
                                            HYVE Haven Limited (&quot;HYVE&quot;, &quot;we&quot;, &quot;us&quot;) is the Data Controller responsible for all personal information collected across the HYVE mobile web platform and associated verification services.
                                        </p>
                                        <ul className="list-disc pl-5 space-y-1 text-gray-600">
                                            <li><strong>Company Name:</strong> HYVE Haven Limited</li>
                                            <li><strong>Registration:</strong> RC 9000322</li>
                                            <li><strong>Registered Address:</strong> 02, Adebola Crescent, Temidire Estate, Alagbole, off Ojodu, Lagos, Nigeria</li>
                                            <li><strong>Data Protection Officer (DPO) Contact:</strong> <a href="mailto:pcosedeme@gmail.com" className="text-primary hover:underline">pcosedeme@gmail.com</a></li>
                                        </ul>
                                    </section>

                                    <section className="space-y-2">
                                        <h3 className="text-base font-bold text-[#1F2937]">2. Legal Basis for Processing Personal Data</h3>
                                        <p>We process your personal information strictly on recognized statutory legal grounds:</p>
                                        <ul className="list-disc pl-5 space-y-1 text-gray-600">
                                            <li><strong>Contractual Necessity:</strong> Processing required to facilitate property listings, queue reservation slots, tenancy agreements, and escrow payment processing.</li>
                                            <li><strong>Legal & Regulatory Compliance:</strong> Conducting Know-Your-Customer (KYC) identity verification, AML checks, and compliance with statutory Nigerian tax and housing regulations.</li>
                                            <li><strong>Legitimate Interests:</strong> Preventing fraud, ensuring security of Escrow transactions, resolving tenant-landlord disputes, and maintaining platform uptime.</li>
                                            <li><strong>Explicit Consent:</strong> Explicit opt-in provided by you for ancillary services, marketing bulletins, and communications.</li>
                                        </ul>
                                    </section>

                                    <section className="space-y-2">
                                        <h3 className="text-base font-bold text-[#1F2937]">3. Categories of Personal Data Collected</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                            <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50">
                                                <p className="font-bold text-gray-900">Identity Data</p>
                                                <p className="text-gray-600 mt-1">Full Name, National Identification Number (NIN), Government ID, passport photograph, and date of birth.</p>
                                            </div>
                                            <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50">
                                                <p className="font-bold text-gray-900">Contact & Address Data</p>
                                                <p className="text-gray-600 mt-1">Phone number, WhatsApp contact, verified email address, residential address, and emergency contact details.</p>
                                            </div>
                                            <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50">
                                                <p className="font-bold text-gray-900">Financial & Transaction Data</p>
                                                <p className="text-gray-600 mt-1">Verified Nigerian bank account numbers for escrow payouts, payment reference tokens, and rent transaction ledgers.</p>
                                            </div>
                                            <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50">
                                                <p className="font-bold text-gray-900">Technical & Device Telemetry</p>
                                                <p className="text-gray-600 mt-1">IP addresses, browser characteristics, session timestamps, and device identifiers to protect against fraudulent logins.</p>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="space-y-2">
                                        <h3 className="text-base font-bold text-[#1F2937]">4. Your Rights Under the NDPR & NDPA</h3>
                                        <p>Every HYVE user retains full sovereignty over their personal records under Nigerian law:</p>
                                        <ul className="list-disc pl-5 space-y-1 text-gray-600">
                                            <li><strong>Right to be Informed:</strong> To receive concise, transparent disclosures regarding how data is gathered and utilized.</li>
                                            <li><strong>Right of Access:</strong> To request a complete digital copy of all personal records held in HYVE servers.</li>
                                            <li><strong>Right to Rectification:</strong> To update inaccurate, incomplete, or outdated personal or banking details.</li>
                                            <li><strong>Right to Erasure (&quot;Right to be Forgotten&quot;):</strong> To request account deletion and removal of personal records subject to active tenancy lease obligations.</li>
                                            <li><strong>Right to Data Portability:</strong> To receive your tenancy and payment history in a structured, commonly used digital format.</li>
                                        </ul>
                                    </section>

                                    <section className="space-y-2">
                                        <h3 className="text-base font-bold text-[#1F2937]">5. Data Security & Storage</h3>
                                        <p>
                                            HYVE implements industry-standard 256-bit encryption for all data at rest and in transit (TLS 1.3). Sensitive credentials such as NIN or banking tokens are tokenized and protected by role-based authorization controls.
                                        </p>
                                    </section>
                                </div>
                            )}

                            {/* POLICY 2: TERMS OF SERVICE */}
                            {activePolicyId === 'terms' && (
                                <div className="space-y-6">
                                    <div className="p-4 rounded-xl bg-[#F9FAFB] border border-[#EAEAEA]">
                                        <p className="font-semibold text-primary">Safe Marketplace & Escrow Agreement</p>
                                        <p className="text-gray-600 mt-1">
                                            By accessing or registering on HYVE Haven, you agree to be bound by these Terms of Service. These terms define the verified marketplace structure, queue protocols, and escrow guarantees.
                                        </p>
                                    </div>

                                    <section className="space-y-2">
                                        <h3 className="text-base font-bold text-[#1F2937]">1. Platform Nature & Role of HYVE</h3>
                                        <p>
                                            HYVE operates as a verified digital marketplace and technology facilitator connecting verified landlords with prospective verified tenants. HYVE is not an estate agency or property owner, but provides escrow trust, queue enforcement, verified property documentation, and dispute mediation.
                                        </p>
                                    </section>

                                    <section className="space-y-2">
                                        <h3 className="text-base font-bold text-[#1F2937]">2. Escrow Protection Mechanism</h3>
                                        <p>
                                            All rental deposits and reservation fees must be transacted through the HYVE platform escrow service.
                                        </p>
                                        <ul className="list-disc pl-5 space-y-1 text-gray-600">
                                            <li>Rent is held securely in escrow and is <strong>never released to the landlord</strong> until the tenant conducts physical key handover and confirms apartment condition.</li>
                                            <li>Any attempt by a landlord or tenant to conduct off-platform cash transactions during an active queue session voids escrow guarantees and is grounds for immediate account termination.</li>
                                        </ul>
                                    </section>

                                    <section className="space-y-2">
                                        <h3 className="text-base font-bold text-[#1F2937]">3. Tenant Queue Integrity</h3>
                                        <p>
                                            Prospective tenants reserve viewing slots in verified chronological queues. Landlords agree to adhere to queue fairness and not pass or skip queued tenants arbitrarily without documented valid reasons.
                                        </p>
                                    </section>

                                    <section className="space-y-2">
                                        <h3 className="text-base font-bold text-[#1F2937]">4. Governing Law & Dispute Resolution</h3>
                                        <p>
                                            These Terms are governed by and construed in accordance with the laws of the Federal Republic of Nigeria. In the event of a rental dispute, the parties agree to submit to HYVE Dispute Mediation prior to initiating court litigation in Lagos State.
                                        </p>
                                    </section>
                                </div>
                            )}

                            {/* POLICY 3: CAUTION FEE HOLDING & RETURN POLICY */}
                            {activePolicyId === 'caution-fee' && (
                                <div className="space-y-6">
                                    <div className="p-4 rounded-xl bg-[#FFF9F5] border border-[#FFE7DB]">
                                        <p className="font-bold text-primary">Caution Fee Direct Holding Notice</p>
                                        <p className="text-gray-700 mt-1">
                                            At this stage of HYVE operations, caution fees (security deposits) are held directly by landlords, not in HYVE escrow. This policy establishes the landlord&apos;s legal obligations and tenant recovery rights.
                                        </p>
                                    </div>

                                    <section className="space-y-2">
                                        <h3 className="text-base font-bold text-[#1F2937]">1. HYVE&apos;s Role Regarding Caution Fees</h3>
                                        <p>
                                            HYVE documents the agreed caution fee in the official Tenancy Agreement and provides verifiable payment receipts. HYVE does not hold or process the caution deposit itself at this operational stage.
                                        </p>
                                    </section>

                                    <section className="space-y-2">
                                        <h3 className="text-base font-bold text-[#1F2937]">2. Landlord Obligations</h3>
                                        <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
                                            <li><strong>Move-In Condition Report:</strong> The landlord must conduct an entrance walkthrough with the tenant and record existing conditions to establish a baseline.</li>
                                            <li><strong>Segregated Holding:</strong> The landlord must hold the caution deposit in a designated account and not expend it for routine property maintenance during tenancy.</li>
                                            <li><strong>14-Day Mandatory Return Window:</strong> Upon tenant move-out and key return, the landlord must refund the caution deposit in full within <strong>14 calendar days</strong>.</li>
                                            <li><strong>Itemized Proof for Deductions:</strong> If deductions are claimed for tenant-inflicted damages, the landlord must provide photographic evidence and verifiable receipts/invoices. Deductions for normal fair wear and tear are strictly prohibited.</li>
                                        </ul>
                                    </section>

                                    <section className="space-y-2">
                                        <h3 className="text-base font-bold text-[#1F2937]">3. Tenant Dispute Escalation</h3>
                                        <p>
                                            If a landlord fails to return the caution fee within 14 days or makes unjustified deductions, the tenant may escalate the matter directly to <strong>HYVE Dispute Mediation</strong> with their signed inventory and move-out photos. Landlords found withholding deposits in bad faith face immediate platform suspension and forfeiture of verified status.
                                        </p>
                                    </section>
                                </div>
                            )}

                            {/* POLICY 4: LANDLORD PARTNERSHIP AGREEMENT */}
                            {activePolicyId === 'landlord-agreement' && (
                                <div className="space-y-6">
                                    <div className="p-4 rounded-xl bg-[#F9FAFB] border border-[#EAEAEA]">
                                        <p className="font-semibold text-primary">Summary of Partnership Covenants</p>
                                        <p className="text-gray-600 mt-1">
                                            Entered into between HYVE Haven Limited (RC 9000322) and verified property landlords listing accommodation on the platform.
                                        </p>
                                    </div>

                                    <section className="space-y-2">
                                        <h3 className="text-base font-bold text-[#1F2937]">1. Commission & Facilitation Fee</h3>
                                        <p>
                                            HYVE charges a standard platform facilitation commission of <strong>5%</strong> on completed rental transactions. This fee is automatically deducted at the time of escrow rental payout. There are zero upfront listing fees.
                                        </p>
                                    </section>

                                    <section className="space-y-2">
                                        <h3 className="text-base font-bold text-[#1F2937]">2. Escrow Payout Schedule</h3>
                                        <p>
                                            Escrow funds are disbursed directly to the landlord&apos;s verified Nigerian bank account within <strong>48 hours</strong> following verified tenant move-in and physical key handover inspection.
                                        </p>
                                    </section>

                                    <section className="space-y-2">
                                        <h3 className="text-base font-bold text-[#1F2937]">3. Queue Exclusivity & Fair Dealing</h3>
                                        <p>
                                            Landlords agree to honor the active queue sequence for their properties. Landlords shall not solicit queued tenants for off-platform cash transactions, nor pass queued tenants without legitimate cause.
                                        </p>
                                    </section>

                                    <section className="space-y-2">
                                        <h3 className="text-base font-bold text-[#1F2937]">4. Warranties & Authority</h3>
                                        <p>
                                            The landlord warrants that they are the lawful owner of the listed property or possess verifiable written authorization (Power of Attorney / Agency mandate) to lease the property. Ghost listings or misrepresentations result in permanent bans and legal referral.
                                        </p>
                                    </section>
                                </div>
                            )}

                            {/* POLICY 5: TENANCY AGREEMENT TEMPLATE */}
                            {activePolicyId === 'tenancy-agreement' && (
                                <div className="space-y-6">
                                    <div className="p-4 rounded-xl bg-[#F9FAFB] border border-[#EAEAEA]">
                                        <p className="font-semibold text-primary">Standard Residential Tenancy Framework</p>
                                        <p className="text-gray-600 mt-1">
                                            This template outlines the standard covenants included in tenancy agreements facilitated through the HYVE platform between landlords and tenants.
                                        </p>
                                    </div>

                                    <section className="space-y-2">
                                        <h3 className="text-base font-bold text-[#1F2937]">1. Standard Term & Rent</h3>
                                        <p>
                                            The tenancy is for a fixed term of 12 calendar months commencing on the confirmed move-in date. Rent is payable annually in advance via HYVE Escrow.
                                        </p>
                                    </section>

                                    <section className="space-y-2">
                                        <h3 className="text-base font-bold text-[#1F2937]">2. Division of Maintenance Obligations</h3>
                                        <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
                                            <li><strong>Landlord Obligations:</strong> Responsible for structural and external maintenance, including the roof, foundation, exterior walls, main plumbing supply lines, and communal utility infrastructure.</li>
                                            <li><strong>Tenant Obligations:</strong> Responsible for keeping the interior clean, replacing light bulbs, maintaining appliances provided within the premises, and repairing any damage caused by deliberate misuse.</li>
                                        </ul>
                                    </section>

                                    <section className="space-y-2">
                                        <h3 className="text-base font-bold text-[#1F2937]">3. Compound & Quiet Hours Policy</h3>
                                        <p>
                                            Tenants and their visitors must adhere to compound rules and observe quiet hours (typically 10:00 PM to 7:00 AM) to maintain peaceful coexistence within the estate.
                                        </p>
                                    </section>

                                    <section className="space-y-2">
                                        <h3 className="text-base font-bold text-[#1F2937]">4. Renewal & Notice to Quit</h3>
                                        <p>
                                            Either party intending not to renew the tenancy at the expiration of the term must provide written notice at least <strong>3 months</strong> prior to the expiration date.
                                        </p>
                                    </section>
                                </div>
                            )}

                            {/* POLICY 6: ACCEPTABLE USE POLICY */}
                            {activePolicyId === 'acceptable-use' && (
                                <div className="space-y-6">
                                    <div className="p-4 rounded-xl bg-[#F9FAFB] border border-[#EAEAEA]">
                                        <p className="font-semibold text-primary">Safety, Dignity, and Trust</p>
                                        <p className="text-gray-600 mt-1">
                                            The HYVE platform exists to restore dignity and safety to housing in Nigeria. This Acceptable Use Policy establishes mandatory behavioral standards for all users.
                                        </p>
                                    </div>

                                    <section className="space-y-2">
                                        <h3 className="text-base font-bold text-[#1F2937]">1. Strictly Prohibited Activities</h3>
                                        <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
                                            <li><strong>Ghost & Fraudulent Listings:</strong> Listing properties that do not exist, uploading staged or copyrighted photos from other sites, or misrepresenting rental rates.</li>
                                            <li><strong>Discrimination:</strong> Denying tenancy or refusing queue slots based on ethnicity, tribe, gender, state of origin, marital status, or religion.</li>
                                            <li><strong>Harassment & Abuse:</strong> Any aggressive, threatening, or sexually inappropriate conduct towards tenants, landlords, or inspection agents.</li>
                                            <li><strong>Circumventing Escrow:</strong> Demanding direct cash deposits, off-platform wire transfers, or unverified &quot;agency/agreement fees&quot; outside HYVE.</li>
                                        </ul>
                                    </section>

                                    <section className="space-y-2">
                                        <h3 className="text-base font-bold text-[#1F2937]">2. Violations & Account Termination</h3>
                                        <p>
                                            Violations are investigated promptly by the HYVE Trust & Safety team. Penalties range from official warnings and listing de-listing to permanent account banning and reporting to law enforcement authorities in cases of financial fraud.
                                        </p>
                                    </section>
                                </div>
                            )}

                            {/* POLICY 7: COOKIE POLICY */}
                            {activePolicyId === 'cookies' && (
                                <div className="space-y-6">
                                    <div className="p-4 rounded-xl bg-[#F9FAFB] border border-[#EAEAEA]">
                                        <p className="font-semibold text-primary">Transparent Cookie Disclosure</p>
                                        <p className="text-gray-600 mt-1">
                                            HYVE uses minimal cookies and local storage technologies strictly to authenticate sessions, secure accounts, and optimize platform speed.
                                        </p>
                                    </div>

                                    <section className="space-y-2">
                                        <h3 className="text-base font-bold text-[#1F2937]">1. Types of Cookies We Use</h3>
                                        <div className="space-y-2.5">
                                            <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50">
                                                <p className="font-bold text-gray-900">Strictly Necessary Cookies</p>
                                                <p className="text-gray-600 mt-0.5">Required for user login, JWT tokens, session security, and anti-CSRF protection. The platform cannot function without these.</p>
                                            </div>
                                            <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50">
                                                <p className="font-bold text-gray-900">Functional & Preference Cookies</p>
                                                <p className="text-gray-600 mt-0.5">Remembers your search filters, budget sliders, and preferred notification settings across browser visits.</p>
                                            </div>
                                            <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50">
                                                <p className="font-bold text-gray-900">Performance & Analytics Telemetry</p>
                                                <p className="text-gray-600 mt-0.5">Anonymous telemetry (via PostHog & Vercel) to track page speed, crash reports, and improve application responsiveness.</p>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="space-y-2">
                                        <h3 className="text-base font-bold text-[#1F2937]">2. How You Can Manage Cookies</h3>
                                        <p>
                                            You can modify your browser settings to decline or remove cookies at any time. Note that disabling strictly necessary cookies will prevent you from logging into your HYVE account.
                                        </p>
                                    </section>
                                </div>
                            )}
                        </article>

                        {/* BOTTOM HELP BANNER */}
                        <div className="pt-6 border-t border-[#F3F4F6] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-primary shrink-0">
                                    <HelpCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-[#1F2937]">Have legal or compliance questions?</p>
                                    <p className="text-[11px] text-[#6B7280]">Our legal and data compliance team is available to assist.</p>
                                </div>
                            </div>
                            <a
                                href="mailto:pcosedeme@gmail.com"
                                className="px-4 py-2 rounded-xl text-xs font-semibold text-primary bg-primary-light hover:bg-primary hover:text-white border border-primary/20 smooth-transition"
                            >
                                Contact Legal Team
                            </a>
                        </div>
                    </div>
                </div>
            </main>

            {/* UNIFIED FOOTER */}
            <Footer />
        </div>
    );
};

export default LegalHub;
