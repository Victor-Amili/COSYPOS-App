import { Routes, Route } from "react-router-dom"
import { AuthProvider } from "./hooks/useAuth";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./components/MainLayout"
import Dashboard from "./pages/Dashboard"
import Orders from "./pages/Orders";
import OrdersTables from "./pages/OrdersTables";
import Notificaton from "./pages/Notificaton";
import MenuPage from "./pages/MenuPage"
import InventoryPage from "./pages/InventoryPage"
import ReservationPage from "./pages/ReservationPage"
import ReservationDetailPage from "./pages/ReservationDetailPage"
import StaffManagement from "./pages/StaffManagement"
import Attendance from "./pages/Attendance"
import StaffProfile from "./pages/StaffProfile"
import Login from "./pages/Login";

function App() {
  return (
    <AuthProvider>
      <Routes>

        <Route path="/" element={<Login />} />


        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>

            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders-tables" element={<OrdersTables />} />
            <Route path="/notifications" element={<Notificaton />} />

            <Route path="/staff" element={<StaffManagement />} />
            <Route path="/staff/attendance" element={<Attendance />} />
            <Route path="/staff/profile/:id" element={<StaffProfile />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/reservation" element={<ReservationPage />} />
            <Route path="/reservation/:id" element={<ReservationDetailPage />} />
          </Route>
        </Route>

        {/* Fallback */}


      </Routes>
    </AuthProvider>


  )
}

export default App
