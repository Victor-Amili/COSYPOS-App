import { useState } from "react"
import { FiChevronDown, FiEdit2 } from "react-icons/fi"
import { useNavigate } from "react-router-dom"

function Attendance() {
    const navigate = useNavigate()
    const [isModalOpen, setIsModalOpen] = useState(false)

    const today = new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    })

    const [staffData, setStaffData] = useState([
        {
            id: "#101",
            name: "Watson Joyce",
            role: "Manager",
            date: today,
            timings: "9am to 6pm",
            image: "https://i.pravatar.cc/150?img=1",
            status: null,
        },
        {
            id: "#102",
            name: "Sarah Williams",
            role: "Cashier",
            date: today,
            timings: "8am to 5pm",
            image: "https://i.pravatar.cc/150?img=2",
            status: "Present",
        },
        {
            id: "#103",
            name: "Michael Scott",
            role: "Supervisor",
            date: today,
            timings: "10am to 7pm",
            image: "https://i.pravatar.cc/150?img=3",
            status: null,
        },
        {
            id: "#104",
            name: "Emily Clark",
            role: "Waitress",
            date: today,
            timings: "9am to 6pm",
            image: "https://i.pravatar.cc/150?img=4",
            status: "Absent",
        },
        {
            id: "#105",
            name: "Daniel Brown",
            role: "Chef",
            date: today,
            timings: "7am to 4pm",
            image: "https://i.pravatar.cc/150?img=5",
            status: null,
        },
        {
            id: "#106",
            name: "Amina Yusuf",
            role: "Receptionist",
            date: today,
            timings: "8am to 5pm",
            image: "https://i.pravatar.cc/150?img=6",
            status: "Leave",
        },
        {
            id: "#107",
            name: "David Wilson",
            role: "Bartender",
            date: today,
            timings: "11am to 8pm",
            image: "https://i.pravatar.cc/150?img=7",
            status: null,
        },
    ])

    const updateStatus = (id, status) => {
        setStaffData((prev) =>
            prev.map((staff) =>
                staff.id === id
                    ? { ...staff, status }
                    : staff
            )
        )
    }

    return (
        <div className="space-y-6">

            {/* TOP SECTION */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                <h1 className="text-white text-2xl font-bold">
                    Staff (22)
                </h1>

                <div className="flex flex-wrap items-center gap-3">

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-[#F4C7D7] text-[#0F0F0F] font-semibold px-5 py-2 rounded-xl hover:opacity-90"
                    >
                        Add Staff
                    </button>

                    <button
                        className="flex items-center gap-2
                        bg-[#1d1d1d] text-white
                        px-4 py-2 rounded-xl"
                    >
                        Sort By
                        <FiChevronDown />
                    </button>

                </div>

            </div>

            {/* TABS */}
            <div className="flex items-center gap-3">

                <button
                    onClick={() => navigate("/staff")}
                    className="px-5 py-2 rounded-xl
                    text-white hover:bg-[#1d1d1d]
                    transition"
                >
                    Staff Management
                </button>

                <button
                    className="px-5 py-2 rounded-xl
                    bg-[#F5C6CC]
                    text-[#071013]
                    font-semibold"
                >
                    Attendance
                </button>

            </div>

            {/* TABLE CARD */}
            <div className="bg-[#1d1d1d] rounded-2xl p-4 h-[550px] flex flex-col">

                <div className="overflow-x-auto">

                    <div className="min-w-[1000px]">

                        {/* HEADER */}
                        <div
                            className="
                            grid
                            grid-cols-[50px_80px_280px_160px_160px_1fr]
                            text-gray-300 text-sm font-medium
                            px-4 py-3 sticky top-0
                            bg-[#1d1d1d] z-10"
                        >

                            <div>
                                <input type="checkbox" />
                            </div>

                            <div>ID</div>
                            <div>Name</div>
                            <div>Date</div>
                            <div>Timings</div>
                            <div>Status</div>

                        </div>

                        {/* SCROLLABLE ROWS */}
                        <div className="max-h-[650px] overflow-y-auto pr-2 space-y-3">

                            {staffData.map((staff, index) => (

                                <div
                                    key={staff.id}
                                    className={`
                                    grid
                                    grid-cols-[50px_80px_280px_160px_160px_1fr]
                                    items-center
                                    px-4 py-4 rounded-xl
                                    ${index % 2 === 0
                                            ? "bg-[#2A2A2A]"
                                            : "bg-[#343434]"
                                        }
                                    `}
                                >

                                    {/* CHECKBOX */}
                                    <div>
                                        <input type="checkbox" />
                                    </div>

                                    {/* ID */}
                                    <div className="text-white">
                                        {staff.id}
                                    </div>

                                    {/* NAME */}
                                    <div className="flex items-center gap-3">

                                        <img
                                            src={staff.image}
                                            alt={staff.name}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />

                                        <div>
                                            <h3 className="text-white font-semibold text-sm">
                                                {staff.name}
                                            </h3>

                                            <p className="text-[#F5C6CC] text-xs">
                                                {staff.role}
                                            </p>
                                        </div>

                                    </div>

                                    {/* DATE */}
                                    <div className="text-white text-sm">
                                        {staff.date}
                                    </div>

                                    {/* TIMINGS */}
                                    <div className="text-white text-sm">
                                        {staff.timings}
                                    </div>

                                    {/* STATUS */}
                                    <div>

                                        {!staff.status ? (

                                            <div className="flex flex-wrap gap-2">

                                                <button
                                                    onClick={() =>
                                                        updateStatus(
                                                            staff.id,
                                                            "Present"
                                                        )
                                                    }
                                                    className="
                                                    px-3 py-1 rounded-lg
                                                    bg-pink-100
                                                    text-pink-600
                                                    text-sm font-medium"
                                                >
                                                    Present
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        updateStatus(
                                                            staff.id,
                                                            "Absent"
                                                        )
                                                    }
                                                    className="
                                                    px-3 py-1 rounded-lg
                                                    bg-yellow-300
                                                    text-yellow-900
                                                    text-sm font-medium"
                                                >
                                                    Absent
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        updateStatus(
                                                            staff.id,
                                                            "Half Shift"
                                                        )
                                                    }
                                                    className="
                                                    px-3 py-1 rounded-lg
                                                    bg-cyan-300
                                                    text-cyan-900
                                                    text-sm font-medium"
                                                >
                                                    Half Shift
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        updateStatus(
                                                            staff.id,
                                                            "Leave"
                                                        )
                                                    }
                                                    className="
                                                    px-3 py-1 rounded-lg
                                                    bg-red-400
                                                    text-white
                                                    text-sm font-medium"
                                                >
                                                    Leave
                                                </button>

                                            </div>

                                        ) : (

                                            <button
                                                onClick={() =>
                                                    updateStatus(
                                                        staff.id,
                                                        null
                                                    )
                                                }
                                                className="
                                                flex items-center gap-2
                                                bg-[#555]
                                                text-white
                                                px-4 py-2 rounded-xl"
                                            >

                                                <span>
                                                    {staff.status}
                                                </span>

                                                <FiEdit2 size={14} />

                                            </button>

                                        )}

                                    </div>

                                </div>

                            ))}

                        </div>

                    </div>

                </div>

            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">

                    {/* OVERLAY */}
                    <div
                        onClick={() => setIsModalOpen(false)}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />

                    {/* MODAL PANEL */}
                    <div
                        className="
                relative
                w-full sm:w-[85%] md:w-[60%] lg:w-[40%]
                h-full
                bg-[#1d1d1d]
                rounded-l-[32px]
                shadow-2xl
                flex flex-col
                transform transition-transform duration-300 ease-in-out
            "
                    >

                        {/* HEADER */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-700">
                            <h2 className="text-white text-2xl font-bold">
                                Add Staff
                            </h2>

                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-white text-xl hover:text-[#F4C7D7]"
                            >
                                ←
                            </button>
                        </div>

                        {/* BODY (SCROLL INSIDE MODAL ONLY) */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">

                            {/* PROFILE UPLOAD */}
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-[200px] h-[180px] bg-[#343434] rounded-xl flex items-center justify-center">
                                    📷
                                </div>

                                <button className="text-[#F4C7D7] underline text-sm">
                                    Change Profile Picture
                                </button>
                            </div>

                            {/* FORM */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                <input placeholder="Full Name"
                                    className="h-[56px] bg-[#343434] rounded-[10px] px-4"
                                />

                                <input placeholder="Email"
                                    className="h-[56px] bg-[#343434] rounded-[10px] px-4"
                                />

                                <select className="h-[56px] bg-[#343434] rounded-[10px] px-4">
                                    <option>Select Role</option>
                                    <option>Manager</option>
                                    <option>Chef</option>
                                    <option>Cashier</option>
                                </select>

                                <input placeholder="Phone Number"
                                    className="h-[56px] bg-[#343434] rounded-[10px] px-4"
                                />

                                <input placeholder="Salary"
                                    className="h-[56px] bg-[#343434] rounded-[10px] px-4"
                                />

                                <input type="date"
                                    className="h-[56px] bg-[#343434] rounded-[10px] px-4"
                                />

                                <input placeholder="Shift Start"
                                    className="h-[56px] bg-[#343434] rounded-[10px] px-4"
                                />

                                <input placeholder="Shift End"
                                    className="h-[56px] bg-[#343434] rounded-[10px] px-4"
                                />

                                <div className="md:col-span-2">
                                    <input placeholder="Address"
                                        className="h-[56px] w-full bg-[#343434] rounded-[10px] px-4"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <textarea placeholder="Additional Details"
                                        className="h-[120px] w-full bg-[#343434] rounded-[12px] px-4 py-3"
                                    />
                                </div>

                            </div>
                        </div>

                        {/* FOOTER */}
                        <div className="flex justify-end gap-4 p-6 border-t border-gray-700">

                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-white"
                            >
                                Cancel
                            </button>

                            <button className="w-[140px] h-[56px] bg-[#F4C7D7] text-[#0F0F0F] font-semibold rounded-[12px]">
                                Confirm
                            </button>

                        </div>

                    </div>
                </div>
            )}

        </div>
    )
}

export default Attendance