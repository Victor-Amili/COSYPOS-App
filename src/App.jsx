import { Routes, Route } from "react-router-dom"
import MainLayout from "./components/MainLayout"
import Dashboard from "./pages/Dashboard"
import Orders from "./pages/Orders";
import OrdersTables from "./pages/OrdersTables";
import Notificaton from "./pages/Notificaton";
import TableOrder from "./pages/OrderQrPage";
function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>

        <Route path="/" element={<Dashboard />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders-tables" element={<OrdersTables />} />
        <Route path="/notifications" element={<Notificaton />} />
        <Route path="/table/:tableId" element={<TableOrder />} />

      </Route>
    </Routes>
  )
}

export default App