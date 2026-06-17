import { useState } from "react"
import Sidebar from "./Sidebar"
import Navbar from "./Navbar"
import { Outlet } from "react-router-dom"

function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">

      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 w-full min-w-0 overflow-hidden">

        {/* Navbar (controls sidebar) */}
        <Navbar setSidebarOpen={setSidebarOpen} />

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>

      </div>
    </div>
  )
}

export default MainLayout