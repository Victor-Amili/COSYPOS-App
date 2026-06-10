import { FiBell, FiChevronLeft, FiMenu } from "react-icons/fi"
import { useNavigate, useLocation } from "react-router-dom"

function Navbar({ setSidebarOpen }) {
    const navigate = useNavigate()
    const location = useLocation()

    const getPageTitle = () => {
        switch (location.pathname) {
            case "/":
                return "Dashboard"
            case "/menu":
                return "Menu"
            case "/staff":
                return "Staff"
            case "/inventory":
                return "Inventory"
            case "/reports":
                return "Reports"
            case "/orders":
                return "Order/Table"
            case "/reservation":
                return "Reservation"
            default:
                return "Dashboard"
        }
    }

    return (
        <div className="bg-black text-white px-6 py-3">

            {/* LINE 1 */}
            <div className="flex items-center justify-between">

                {/* Logo */}
                <div className="text-[#F5C6CC] font-bold text-xl">
                    COSYPOS
                </div>

                {/* Right Icons */}
                <div className="flex items-center gap-4">

                    {/* Notification */}
                    <div
                        onClick={() => navigate("/notifications")}
                        className="relative cursor-pointer"
                    >
                        <FiBell size={15} />

                        <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-[#F5C6CC]
            text-black text-[10px] flex items-center justify-center font-bold">
                            3
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="text-gray-500">|</div>

                    {/* Profile */}
                    <div
                        onClick={() => navigate("/profile")}
                        className="w-8 h-8 rounded-full overflow-hidden cursor-pointer border border-brand"
                    >
                        <img
                            src="https://i.pravatar.cc/150"
                            className="w-full h-full object-cover"
                            alt="profile"
                        />
                    </div>

                    {/* Hamburger */}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-2xl md:hidden"
                    >
                        <FiMenu />
                    </button>

                </div>
            </div>

            {/* LINE 2 */}
            <div className="flex items-center mt-2">

                <button
                    onClick={() => navigate(-1)}
                    className="text-white text-xl mr-2 bg-[#071013] rounded-full p-1 
          hover:bg-[#F5C6CC] hover:text-[#7D5B67] transition"
                >
                    <FiChevronLeft />
                </button>

                <h1 className="text-2xl font-bold">
                    {getPageTitle()}
                </h1>

            </div>

        </div>
    )
}

export default Navbar