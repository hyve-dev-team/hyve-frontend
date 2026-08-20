import { BrowserRouter, Route, Routes } from "react-router-dom"
import MainLayout from "./components/layout/MainLayout"

/* Landing page */
import Homepage from "./pages/Homepage"

/* Onboarding  */
import Onboarding from "./pages/onboarding/Onboarding"

/* Auth Pages */
import Sign_up from "./pages/authentication/Sign_up"
import Login from "./pages/authentication/Login"
import Verification from "./pages/authentication/Verification"
import WhichUser from "./pages/authentication/WhichUser"

/* Tenant dashboard */
import MyQueues from "./pages/tenant/components/layout/Queue/TenantQueue"
import ApartmentQueue from "./pages/tenant/components/layout/Queue/ApartmentQueue"
import TenantDashboard from "./pages/tenant/TenantDashboard"
import ApartmentDetails from "./pages/tenant/ApartmentDetails"
import ApartmentReviews from "./pages/tenant/ApartmentReviews"
import ManageApartment from "./pages/tenant/ManageApartment"
import SavedApartments from "./pages/tenant/SavedApartments"
import Notifications from "./pages/tenant/Notifications"
import ChatList from "./pages/tenant/ChatList"
import Conversation from "./pages/tenant/components/layout/Chat/Conversation"
import Profile from "./pages/tenant/Profile"
import Activity from "./pages/tenant/Activity"
import Search from "./pages/tenant/Search"
import UpdateProfile from "./pages/UpdateProfile"
import Reservation from "./pages/tenant/Reservation"
import ScheduleTour from "./pages/tenant/ScheduleTour"
import ScheduleMoveIn from "./pages/tenant/ScheduleMoveIn"
import ProtectedRoute from "./route/ProtectedRoute"
// import LandlordProtectedRoute from "./route/LandlordProtectedRoute"

/* Landlord dashboard */
import LandlordDashboard from "./pages/landlord/LandlordDashboard"
import LandlordNotifications from "./pages/landlord/Notifications"
import AddProperty from "./pages/landlord/AddProperty"
import LandlordProfile from "./pages/landlord/Profile"
import UpdateLandlordProfile from "./pages/landlord/UpdateProfile"
import AccountVerification from "./pages/landlord/AccountVerification"
import LandlordActivity from "./pages/landlord/Activity"
import LandlordChatList from "./pages/landlord/ChatList"
import LandlordConversation from "./pages/landlord/components/layout/Chat/Conversation"
import LandordApartmentReviews from "./pages/landlord/ApartmentReviews"
import ManageProperty from "./pages/landlord/ApartmentDetails"
import UpdateProperty from "./pages/landlord/UpdateProperty"
import Toaster from "./components/ui/Toaster"



/* Dashboard */
function App() {
  return (
    <>
      {/* Routes configuration */}
      <Toaster />
      <BrowserRouter>
        
        <Routes>
          {/* Landing Page Route */}
          <Route path="/" element={<MainLayout><Homepage /></MainLayout>} />

          {/* Onboarding screens route */}
          <Route path="/onboarding" element={<Onboarding />} />

          {/* Sign up page route */}
          <Route path="/auth/signup/:userRole" element={<Sign_up />} />
          <Route path="/auth/signin/:userRole" element={<Login />} />
          <Route path="/auth/verify" element={<Verification />} />
          <Route path="/auth/pre-login" element={<WhichUser />} />



          {/* Tenant Dashboard Routes*/}
          <Route path="/user/dashboard" element={<ProtectedRoute><TenantDashboard /></ProtectedRoute>} /> {/* User dashboard */}
          <Route path="/user/apartment/:apartmentID" element={<ProtectedRoute><ApartmentDetails /></ProtectedRoute>} /> {/* View apartment details */}
          <Route path="/user/apartment/review/:apartmentID" element={<ProtectedRoute><ApartmentReviews /></ProtectedRoute>} /> {/* Review an aprtment */}
          <Route path="/user/apartment/manage" element={<ProtectedRoute><ManageApartment /></ProtectedRoute>} /> {/* Managae booked apartment */}
          <Route path="/user/apartment/saved" element={<ProtectedRoute><SavedApartments /></ProtectedRoute>} /> {/* View saved apartments */}

          <Route path="/user/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} /> {/* Notification page */}

          {/* Chat */}
          <Route path="/user/chats" element={<ProtectedRoute><ChatList /></ProtectedRoute>} /> {/* All chats page */}
          <Route path="/user/conversation/:chatID" element={<ProtectedRoute><Conversation /></ProtectedRoute>} /> {/* Conversation page */}

          {/* Profile */}
          <Route path="/user/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} /> {/* User profile page */}
          <Route path="/user/profile/update" element={<ProtectedRoute><UpdateProfile /></ProtectedRoute>} /> {/* User -- update profile page */}
          <Route path="/user/activity" element={<ProtectedRoute><Activity /></ProtectedRoute>} /> {/* Preview all activity */}

          <Route path="/user/apartment/search" element={<ProtectedRoute><Search /></ProtectedRoute>} /> {/* Search page */}

          {/* Queue */}
          <Route path="/user/apartment/queue" element={<ProtectedRoute><MyQueues /></ProtectedRoute>} />
          <Route path="/user/apartment/:apartmentID/queue" element={<ProtectedRoute><ApartmentQueue /></ProtectedRoute>} />

          {/* Reservations */}
          <Route path="/user/apartment/reserve/:apartmentID" element={<ProtectedRoute><Reservation /></ProtectedRoute>} /> {/* Reserve apartment (book apartment) */}
          <Route path="/user/apartment/schedule-tour/:apartmentID" element={<ProtectedRoute><ScheduleTour /></ProtectedRoute>} /> {/* Schedule apartment tour */}
          <Route path="/user/apartment/schedule-move-in/:apartmentID" element={<ProtectedRoute><ScheduleMoveIn /></ProtectedRoute>} /> {/* Schedule move in */}


          {/* 
          Landlord Dashboard Routes - Some Components/pages can be shared by the user and landdlord, they are seperated just for design sake (static) */}

          <Route path="/landlord/dashboard" element={<LandlordDashboard />} /> {/* Landlord dashboard  */}
          <Route path="/landlord/notifications" element={<LandlordNotifications />} /> {/* Notification page */}
          <Route path="/landlord/property/add" element={<AddProperty />} /> {/* Add property */}
          <Route path="/landlord/profile" element={<LandlordProfile />} /> {/* Landlord profile page */}
          <Route path="/landlord/profile/update" element={<UpdateLandlordProfile />} /> {/* Landlord -- update profile page */}
          <Route path="/landlord/verification" element={<AccountVerification />} /> {/* Landlord -- update profile page */}
          <Route path="/landlord/activity" element={<LandlordActivity />} /> {/* Landlord -- activity page */}
          <Route path="/landlord/chats" element={<LandlordChatList />} /> {/* Landlord -- All chats page */}
          <Route path="/landlord/conversation/:chatID" element={<LandlordConversation />} /> {/* Landlord --  Conversation page */}
          <Route path="/landlord/property/:apartmentID/reviews" element={<LandordApartmentReviews />} /> {/* view apartment review */}
          <Route path="/landlord/property/:apartmentID/manage" element={<ManageProperty />} /> {/* View apartment details */}
          <Route path="/landlord/property/:apartmentID/update" element={<UpdateProperty />} /> {/* update apartment details */}


          {/* Redirect unauthorized route visits  or 404 page*/}
          <Route path="*" element={<MainLayout><Homepage /></MainLayout>} />
          <Route path="/signup/*" element={<Login />} />

        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
