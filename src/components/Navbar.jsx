import { FiBell, FiChevronLeft, FiMenu } from "react-icons/fi"
import { useNavigate, useLocation } from "react-router-dom"

function Navbar({ setSidebarOpen }) {
    const navigate = useNavigate()
    const location = useLocation()

    const getPageTitle = () => {

        // Staff Profile Page
        if (
            location.pathname.startsWith("/staff/profile/")
        ) {
            return location.state?.name || "Staff Profile"
        }

         if (location.pathname.startsWith("/reservation/") && location.pathname !== "/reservation") {
            return "Reservation Details"
        }

        switch (location.pathname) {
            case "/":
                return "Dashboard"

            case "/staff":
                return "Staff Management"

            case "/staff/attendance":
                return "Attendance"

            case "/menu":
                return "Menu"

            case "/inventory":
                return "Inventory"

            case "/reports":
                return "Reports"

            case "/revenue-report":
                return "Reports"

            case "/staff-report":
                return "Reports"

            case "/reservation/:id":
                return "Reservation Details"

            case "/orders":
                return "Order"
            case "/reservation":
                return "Reservation"
            case "/notifications":
                return "Notifications"
            case "/orders-tables":
                return "Order/Table"


            default:
                return "Dashboard"
        }
    }

    return (
        <div className="h-16 px-6 flex items-center justify-between bg-black">

            {/* Left Side */}
            <div className="flex items-center">

                <button
                    onClick={() => navigate(-1)}
                    className="text-white text-2xl cursor-pointer mr-2 bg-[#071013] rounded-full p-1
                flex items-center justify-center
                hover:bg-[#F5C6CC] hover:text-[#7D5B67] transition-colors duration-200"
                >
                    <FiChevronLeft />
                </button>

                <h1 className="text-3xl font-bold text-white">
                    {getPageTitle()}
                </h1>

            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">

                {/* Notification */}
                <div
                    onClick={() => navigate("/notifications")}
                    className="relative cursor-pointer"
                >
                    <FiBell size={15} className="text-white" />

                    <div
                        className="absolute -top-2 -right-2
                    w-4 h-4 rounded-full bg-[#F5C6CC]
                    text-black text-[10px]
                    flex items-center justify-center font-bold"
                    >
                        3
                    </div>
                </div>

                {/* Divider */}
                <div className="text-gray-500 text-xl">
                    |
                </div>

                {/* Profile */}
                <div
                    onClick={() => navigate("/profile")}
                    className="w-10 h-10 rounded-full overflow-hidden
                cursor-pointer border-2 border-pink-300"
                >
                    <img
                        src="https://i.pravatar.cc/150"
                        alt="profile"
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Mobile Hamburger */}
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="text-2xl md:hidden"
                >
                    <FiMenu />
                </button>

            </div>

        </div>

    )
}

export default Navbar