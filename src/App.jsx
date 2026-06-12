import { Routes, Route } from "react-router-dom"
import MainLayout from "./components/MainLayout"
import Dashboard from "./pages/Dashboard"
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

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/reports" element={<ReservationReport />} />
        <Route path="/revenue-report" element={<RevenueReport />} />
        <Route path="/staff-report" element={<StaffReport />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/reservation" element={<ReservationPage />} />
        <Route path="/reservation/:id" element={<ReservationDetailPage />} />
        <Route path="/staff" element={<StaffManagement />} />
        <Route path="/staff/attendance" element={<Attendance />} />
        <Route path="/staff/profile/:id" element={<StaffProfile />} />
      </Route>

    </Routes>
  )
}

export default App
