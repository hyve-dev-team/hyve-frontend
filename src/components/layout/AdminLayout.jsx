import AdminSidebar from './AdminSidebar';

const AdminLayout = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-[#FDFDFE] font-poppins selection:bg-[#FA6400]/20 selection:text-[#FA6400]">
            {/* Orange Brand Sidebar */}
            <AdminSidebar />

            {/* Main Content Pane */}
            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                {children}
            </div>
        </div>
    );
};

export default AdminLayout;
