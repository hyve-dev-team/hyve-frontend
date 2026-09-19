import AdminLayout from '../../components/layout/AdminLayout';
import AdminHeader from '../../components/layout/AdminHeader';

const AdminPlaceholder = ({ title = "Management", subtitle = "Manage Hyve operations" }) => {
    return (
        <AdminLayout>
            <AdminHeader title={title} showWavingHand={false} />
            <main className="p-6 sm:p-10 space-y-6 max-w-7xl">
                <div className="bg-white rounded-3xl p-10 border border-stone-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] text-center py-16">
                    <div className="w-16 h-16 rounded-2xl bg-orange-50 text-[#FA6400] flex items-center justify-center text-2xl mx-auto mb-4 font-bold font-poppins">
                        HYVE
                    </div>
                    <h2 className="text-xl font-bold text-stone-900 font-poppins mb-2">{title}</h2>
                    <p className="text-sm text-stone-500 max-w-md mx-auto">{subtitle}</p>
                </div>
            </main>
        </AdminLayout>
    );
};

export default AdminPlaceholder;
