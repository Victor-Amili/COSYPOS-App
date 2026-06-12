import { Routes, Route } from "react-router-dom"
import MainLayout from "./components/MainLayout"
import Dashboard from "./pages/Dashboard"
import ReservationReport from "./pages/ReservationReport"
import RevenueReport from "./pages/RevenueReport"
import StaffReport from "./pages/StaffReport"

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/reports" element={<ReservationReport />} />
        <Route path="/revenue-report" element={<RevenueReport />} />
        <Route path="/staff-report" element={<StaffReport />} />
      </Route>
    </Routes>
  )
}

export default App