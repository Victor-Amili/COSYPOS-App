import { Routes, Route } from "react-router-dom"
import MainLayout from "./components/MainLayout"
import Dashboard from "./pages/Dashboard"
import Login from "./pages/Login"
import ForgottenPassword from "./pages/ForgottenPassword"

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Login />} />
      <Route path="/forgot-password" element={<ForgottenPassword />} />

      {/* Protected routes */}
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
    </Routes>
  )
}

export default App