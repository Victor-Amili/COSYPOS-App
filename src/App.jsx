import { Routes, Route } from "react-router-dom"
import MainLayout from "./components/MainLayout"
import Dashboard from "./pages/Dashboard"
import Orders from "./pages/Orders";
import OrdersTables from "./pages/OrdersTables";
import Notificaton from "./pages/Notificaton";
import TableOrder from "./pages/OrderQrPage";
import StaffManagement from "./pages/StaffManagement"
import Attendance from "./pages/Attendance"
import StaffProfile from "./pages/StaffProfile"

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>

        <Route path="/" element={<Dashboard />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders-tables" element={<OrdersTables />} />
        <Route path="/notifications" element={<Notificaton />} />
        <Route path="/table/:tableId" element={<TableOrder />} />

        <Route path="/staff" element={<StaffManagement />} />
        <Route path="/staff/attendance" element={<Attendance />} />
        <Route path="/staff/profile/:id" element={<StaffProfile />} />
      </Route>

    </Routes>
  )
}

export default App