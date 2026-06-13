import { useNavigate, useLocation } from "react-router-dom"
import { FiGrid, FiLogOut } from "react-icons/fi"

function Sidebar({ sidebarOpen, setSidebarOpen }) {
    const navigate = useNavigate()
    const location = useLocation()

    const items = [
        { name: "Dashboard", icon: FiGrid, path: "/dashboard" },
        { name: "Menu", icon: FiGrid, path: "/menu" },
        { name: "Staff", icon: FiGrid, path: "/staff" },
        { name: "Inventory", icon: FiGrid, path: "/inventory" },
        { name: "Reports", icon: FiGrid, path: "/reports" },
        { name: "Order/Table", icon: FiGrid, path: "/orders" },
        { name: "Reservation", icon: FiGrid, path: "/reservation" },
    ]

    const isActive = (path) => {
        if (path === "/") return location.pathname === "/"
        return location.pathname.startsWith(path)
    }

    return (
        <div
            className={`
        fixed md:static z-50
        w-44 min-h-screen bg-[#1d1d1d] text-white flex flex-col rounded-r-3xl
        transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
        >
            {/* Logo */}
            <div className="p-4 text-xl text-center text-[#F5C6CC] font-bold">
                COSYPOS
            </div>

            {/* Menu Items */}
            <div className="flex-1 p-1 space-y-1">
                {items.map((item, index) => {
                    const Icon = item.icon
                    const active = isActive(item.path)

                    return (
                        <div
                            key={index}
                            onClick={() => {
                                navigate(item.path)
                                setSidebarOpen(false)
                            }}
                            className={`flex flex-col items-center justify-center p-2 cursor-pointer
                                rounded-xl transition-all duration-200
                                ${active
                                    ? "bg-[#F5C6CC] text-[#7D5B67]"
                                    : "hover:bg-[#F5C6CC] hover:text-[#7D5B67]"
                                }`}
                        >
                            <div className="border-b border-[#0f1a20] w-14 pb-2 flex flex-col items-center">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center
                                    ${active ? "bg-[#7D5B67]" : "bg-white"}`}>
                                    <Icon
                                        size={15}
                                        className={active ? "text-[#F5C6CC]" : "text-[#F5C6CC]"}
                                    />
                                </div>
                                <span className="text-xs mt-1">{item.name}</span>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Logout */}
            <div className="p-4">
                <div
                    onClick={() => {
                        navigate("/")
                        setSidebarOpen(false)
                    }}
                    className="group flex flex-col items-center justify-center py-2 px-1 cursor-pointer
                        hover:bg-[#F5C6CC] hover:text-[#7D5B67] hover:rounded-xl transition-all duration-200"
                >
                    <FiLogOut size={15} className="text-[#F5C6CC] group-hover:text-[#7D5B67]" />
                    <span className="text-xs">Logout</span>
                </div>
            </div>
        </div>
    )
}

export default Sidebar