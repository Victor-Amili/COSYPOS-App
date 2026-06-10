import { Navigate, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./hooks/useAuth";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./components/MainLayout"
import Dashboard from "./pages/Dashboard"
import Orders from "./pages/Orders";
import OrdersTables from "./pages/OrdersTables";
import Notificaton from "./pages/Notificaton";
import StaffManagement from "./pages/StaffManagement"
import Attendance from "./pages/Attendance"
import StaffProfile from "./pages/StaffProfile"
import Login from "./pages/Login";

function App() {
  return (
    <AuthProvider>
        <Routes>

          <Route path="/login" element={<Login />} />

          
          <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>

            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders-tables" element={<OrdersTables />} />
            <Route path="/notifications" element={<Notificaton />} />

            <Route path="/staff" element={<StaffManagement />} />
            <Route path="/staff/attendance" element={<Attendance />} />
            <Route path="/staff/profile/:id" element={<StaffProfile />} />
          </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />


        </Routes>
    </AuthProvider>

  )
}

export default App