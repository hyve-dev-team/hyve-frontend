import { useState, useEffect, useCallback } from 'react';
import { FaWhatsapp, FaUserShield, FaTrash, FaPlus, FaCheckCircle, FaUserTie, FaPhoneAlt } from 'react-icons/fa';
import { getPropertyAgents, addPropertyAgent, deletePropertyAgent, formatWhatsAppPhone, formatDisplayPhone } from '../../../utils/inspectionApi';
import { hyveSuccess, hyveError } from '../../../utils/hyveToast';

const AgentSetupSection = ({ propertyId, propertyTitle, landlordPhone, landlordName }) => {
    const [agents, setAgents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    // Form state
    const [fullName, setFullName] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [roleTitle, setRoleTitle] = useState('Caretaker');
    const [isPrimary, setIsPrimary] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);

    const loadAgents = useCallback(async () => {
        if (!propertyId) return;
        setIsLoading(true);
        try {
            const data = await getPropertyAgents(propertyId);
            setAgents(data || []);
        } catch (err) {
            console.warn("Could not load agents for property:", err?.message);
        } finally {
            setIsLoading(false);
        }
    }, [propertyId]);

    useEffect(() => {
        loadAgents();
    }, [loadAgents]);

    const handleAddAgent = async (e) => {
        e.preventDefault();
        if (!fullName.trim() || !whatsappNumber.trim()) {
            hyveError("Required Fields", "Please enter the agent's full name and WhatsApp number.");
            return;
        }

        const normalizedPhone = formatDisplayPhone(whatsappNumber.trim());

        setIsSaving(true);
        try {
            await addPropertyAgent(propertyId, {
                fullName: fullName.trim(),
                whatsappNumber: normalizedPhone,
                roleTitle: roleTitle.trim() || "Caretaker",
                isPrimary: isPrimary || agents.length === 0,
            });
            hyveSuccess("Agent Saved", `${fullName} has been added as an inspection contact.`);
            setFullName('');
            setWhatsappNumber('');
            setIsPrimary(false);
            setShowAddForm(false);
            loadAgents();
        } catch (err) {
            hyveError("Error saving agent", err?.message || "Could not save agent details.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAgent = async (agentId, agentName) => {
        if (!window.confirm(`Remove ${agentName} as an inspection agent?`)) return;
        setDeletingId(agentId);
        try {
            await deletePropertyAgent(propertyId, agentId);
            hyveSuccess("Agent Removed", `${agentName} was removed from this property.`);
            loadAgents();
        } catch (err) {
            hyveError("Failed to delete", err?.message || "Could not delete agent.");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#EAEAEA] p-5 sm:p-7 shadow-sm mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#F3F4F6]">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="p-2 rounded-xl bg-primary/10 text-primary">
                            <FaUserTie className="w-5 h-5" />
                        </span>
                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-[#1F2937] font-poppins">
                                Assigned Agents & Caretakers
                            </h3>
                            <p className="text-xs text-[#6B7280]">
                                When tenants schedule an in-person tour, inspection links and WhatsApp alerts go to these contacts.
                            </p>
                        </div>
                    </div>
                </div>

                {!showAddForm && (
                    <button
                        type="button"
                        onClick={() => setShowAddForm(true)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-primary-hover shadow-sm smooth-transition self-start sm:self-auto"
                    >
                        <FaPlus className="w-3 h-3" />
                        Add Agent / Caretaker
                    </button>
                )}
            </div>

            {/* ADD AGENT MODAL / FORM */}
            {showAddForm && (
                <form onSubmit={handleAddAgent} className="mt-5 p-5 bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB] animate-fadeIn">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-bold text-[#1F2937]">New Caretaker / Agent Details</h4>
                        <button
                            type="button"
                            onClick={() => setShowAddForm(false)}
                            className="text-xs text-[#6B7280] hover:text-[#1F2937]"
                        >
                            Cancel
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-[#4B5563] mb-1">Full Name *</label>
                            <input
                                type="text"
                                placeholder="e.g. Babatunde Lawal"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#D1D5DB] rounded-xl outline-none focus:border-primary"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-[#4B5563] mb-1">WhatsApp Number *</label>
                            <div className="flex items-center rounded-xl border border-[#D1D5DB] bg-white overflow-hidden focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                                <div className="flex items-center gap-1.5 px-3 py-2.5 bg-gray-50 border-r border-[#E5E7EB] text-xs font-semibold text-gray-700 select-none shrink-0">
                                    <span>🇳🇬</span>
                                    <span>+234</span>
                                </div>
                                <input
                                    type="tel"
                                    placeholder="805 623 7380 (or 080...)"
                                    value={whatsappNumber}
                                    onChange={(e) => {
                                        let val = e.target.value;
                                        if (val.startsWith("+234")) val = val.slice(4).trim();
                                        else if (val.startsWith("234") && val.length > 5) val = val.slice(3).trim();
                                        if (val.startsWith("0")) val = val.slice(1).trim();
                                        setWhatsappNumber(val);
                                    }}
                                    className="w-full px-3 py-2.5 text-xs bg-transparent outline-none"
                                    required
                                />
                            </div>
                            <p className="text-[10px] text-gray-500 mt-1">
                                Country code +234 is handled automatically.
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-[#4B5563] mb-1">Role / Designation</label>
                            <select
                                value={roleTitle}
                                onChange={(e) => setRoleTitle(e.target.value)}
                                className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#D1D5DB] rounded-xl outline-none focus:border-primary"
                            >
                                <option value="Caretaker">Caretaker</option>
                                <option value="Facility Manager">Facility Manager</option>
                                <option value="Viewing Agent">Viewing Agent</option>
                                <option value="Co-Landlord">Co-Landlord</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-3 border-t border-[#E5E7EB]">
                        <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-[#4B5563]">
                            <input
                                type="checkbox"
                                checked={isPrimary}
                                onChange={(e) => setIsPrimary(e.target.checked)}
                                className="w-4 h-4 accent-primary rounded cursor-pointer"
                            />
                            <span>Set as Primary Contact (receives inspection alerts first)</span>
                        </label>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setShowAddForm(false)}
                                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#4B5563] bg-white border border-[#D1D5DB] hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-primary-hover shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                            >
                                {isSaving ? "Saving..." : "Save Agent"}
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {/* LIST OF SAVED AGENTS */}
            <div className="mt-5">
                {isLoading ? (
                    <div className="py-6 text-center text-xs text-[#9CA3AF]">
                        Loading assigned agents...
                    </div>
                ) : agents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {agents.map((agent) => {
                            const cleanPhone = formatWhatsAppPhone(agent.whatsappNumber);
                            return (
                                <div
                                    key={agent.id}
                                    className="p-4 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] flex items-center justify-between gap-3 hover:border-primary/40 smooth-transition"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-sm shrink-0">
                                            {agent.fullName?.charAt(0)?.toUpperCase() || 'A'}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-xs sm:text-sm font-bold text-[#1F2937] truncate">
                                                    {agent.fullName}
                                                </h4>
                                                {agent.isPrimary && (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 shrink-0">
                                                        Primary
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[11px] text-[#6B7280]">
                                                    {agent.roleTitle || 'Caretaker'}
                                                </span>
                                                <span className="text-[#D1D5DB]">•</span>
                                                <span className="text-[11px] font-mono text-[#4B5563]">
                                                    {agent.whatsappNumber}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <a
                                            href={`https://wa.me/${cleanPhone}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="p-2 rounded-xl text-[#059669] bg-[#ECFDF5] hover:bg-[#D1FAE5] smooth-transition"
                                            title="Test WhatsApp connection"
                                        >
                                            <FaWhatsapp className="w-4 h-4" />
                                        </a>

                                        <button
                                            type="button"
                                            onClick={() => handleDeleteAgent(agent.id, agent.fullName)}
                                            disabled={deletingId === agent.id}
                                            className="p-2 rounded-xl text-[#EF4444] bg-[#FEF2F2] hover:bg-[#FEE2E2] smooth-transition disabled:opacity-50"
                                            title="Delete agent"
                                        >
                                            <FaTrash className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* FALLBACK BANNER WHEN NO AGENT IS CONFIGURED */
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <span className="p-2 rounded-xl bg-[#F59E0B]/20 text-[#D97706] shrink-0 mt-0.5 sm:mt-0">
                                <FaUserShield className="w-4 h-4" />
                            </span>
                            <div>
                                <h4 className="text-xs sm:text-sm font-bold text-[#92400E]">
                                    No Caretaker Assigned — Landlord Direct Mode Active
                                </h4>
                                <p className="text-xs text-[#B45309] mt-0.5 leading-relaxed">
                                    Tour inspection requests and WhatsApp messages will automatically be routed directly to your personal phone on file:
                                    <span className="font-semibold ml-1">
                                        {landlordPhone ? `${landlordName || "Owner"} (${landlordPhone})` : "Your registered profile number"}
                                    </span>.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowAddForm(true)}
                            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#92400E] bg-[#FEF3C7] hover:bg-[#FDE68A] border border-[#FCD34D] smooth-transition self-start sm:self-auto shrink-0"
                        >
                            + Assign Caretaker
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgentSetupSection;
