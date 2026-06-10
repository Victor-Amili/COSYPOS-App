import { Routes, Route } from "react-router-dom"
import MainLayout from "./components/MainLayout"
import Dashboard from "./pages/Dashboard"
import MenuPage from "./pages/MenuPage"
import InventoryPage from "./pages/InventoryPage"
import ReservationPage from "./pages/ReservationPage"
import ReservationDetailPage from "./pages/ReservationDetailPage"

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/reservation" element={<ReservationPage />} />
        <Route path="/reservation/:id" element={<ReservationDetailPage />} />
      </Route>
    </Routes>
  )
}

export default App
