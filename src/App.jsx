import { Routes, Route } from "react-router-dom"
import { AuthProvider } from "./hooks/useAuth";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./components/MainLayout"
import Dashboard from "./pages/Dashboard"
import Orders from "./pages/Orders";
import OrdersTables from "./pages/OrdersTables";
import Notificaton from "./pages/Notificaton";
import ReservationReport from "./pages/ReservationReport"
import RevenueReport from "./pages/RevenueReport"
import StaffReport from "./pages/StaffReport"
import MenuPage from "./pages/MenuPage"
import InventoryPage from "./pages/InventoryPage"
import ReservationPage from "./pages/ReservationPage"
import ReservationDetailPage from "./pages/ReservationDetailPage"
import StaffManagement from "./pages/StaffManagement"
import Attendance from "./pages/Attendance"
import StaffProfile from "./pages/StaffProfile"
import Profile from "./pages/Profile"
import Login from "./pages/Login";
import ForgottenPassword from "./pages/ForgottenPassword";
import CustomerPayment from "./pages/CustomerPayment";

function App() {
  return (
    <AuthProvider>
      <Routes>

        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgottenPassword />} />

        <Route path="/pay" element={<CustomerPayment />} />


        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>

            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders-tables" element={<OrdersTables />} />
            <Route path="/notifications" element={<Notificaton />} />
            <Route path="/reports" element={<ReservationReport />} />
            <Route path="/revenue-report" element={<RevenueReport />} />
            <Route path="/staff-report" element={<StaffReport />} />

            <Route path="/staff" element={<StaffManagement />} />
            <Route path="/staff/attendance" element={<Attendance />} />
            <Route path="/staff/profile/:id" element={<StaffProfile />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/reservation" element={<ReservationPage />} />
            <Route path="/reservation/:id" element={<ReservationDetailPage />} />
            <Route path="/reports" element={<ReservationReport />} />
            <Route path="/revenue-report" element={<RevenueReport />} />
            <Route path="/staff-report" element={<StaffReport />} />

          </Route>
        </Route>

        


      </Routes>
    </AuthProvider>


  )
}

export default App
