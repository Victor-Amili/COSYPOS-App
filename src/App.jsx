import { Routes, Route } from "react-router-dom"
import MainLayout from "./components/MainLayout"
import Dashboard from "./pages/Dashboard"
import StaffManagement from "./pages/StaffManagement"
import Attendance from "./pages/Attendance"
import StaffProfile from "./pages/StaffProfile"

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>

        <Route path="/" element={<Dashboard />} />
        <Route path="/staff" element={<StaffManagement />} />
        <Route path="/staff/attendance" element={<Attendance />} />
        <Route path="/staff/profile/:id" element={<StaffProfile />} />
      </Route>

    </Routes>
  )
}

export default App