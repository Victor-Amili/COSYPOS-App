import { useState } from "react"
import { FiEye, FiEdit2, FiTrash2, FiChevronDown } from "react-icons/fi"
import { useNavigate } from "react-router-dom"

function StaffManagement() {
    const navigate = useNavigate()
    const [isModalOpen, setIsModalOpen] = useState(false)

    const staffData = [
        {
            id: "101",
            name: "Watson Joyce",
            role: "Manager",
            email: "watsonjoyce112@gmail.com",
            phone: "+1 (123) 123 4654",
            age: "45 yr",
            salary: "$2200.00",
            timings: "9am to 6pm",
            image: "https://i.pravatar.cc/150?img=1",
        },
        {
            id: "102",
            name: "Sarah Williams",
            role: "Cashier",
            email: "sarah@gmail.com",
            phone: "+1 (123) 555 7890",
            age: "32 yr",
            salary: "$1800.00",
            timings: "8am to 5pm",
            image: "https://i.pravatar.cc/150?img=2",
        },
        {
            id: "103",
            name: "Michael Scott",
            role: "Supervisor",
            email: "michael@gmail.com",
            phone: "+1 (123) 222 7890",
            age: "40 yr",
            salary: "$2500.00",
            timings: "10am to 7pm",
            image: "https://i.pravatar.cc/150?img=3",
        },
        {
            id: "104",
            name: "Emily Clark",
            role: "Waitress",
            email: "emily@gmail.com",
            phone: "+1 (123) 333 4567",
            age: "28 yr",
            salary: "$1500.00",
            timings: "9am to 6pm",
            image: "https://i.pravatar.cc/150?img=4",
        },
        {
            id: "105",
            name: "Daniel Brown",
            role: "Chef",
            email: "daniel@gmail.com",
            phone: "+1 (123) 444 4567",
            age: "38 yr",
            salary: "$2800.00",
            timings: "7am to 4pm",
            image: "https://i.pravatar.cc/150?img=5",
        },
        {
            id: "106",
            name: "Amina Yusuf",
            role: "Receptionist",
            email: "amina.yusuf@gmail.com",
            phone: "+1 (123) 777 8899",
            age: "29 yr",
            salary: "$1600.00",
            timings: "8am to 5pm",
            image: "https://i.pravatar.cc/150?img=6",
        },

    ]

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
                        className="bg-[#F5C6CC] text-[#071013] font-semibold px-5 py-2 rounded-xl hover:opacity-90"
                    >
                        Add Staff
                    </button>

                    <button
                        className="flex items-center gap-2 bg-[#1d1d1d] text-white px-4 py-2 rounded-xl"
                    >
                        Sort By
                        <FiChevronDown />
                    </button>

                </div>

            </div>

            {/* TABS */}
            <div className="flex items-center gap-3">

                <button
                    className="px-5 py-2 rounded-xl font-semibold bg-[#F5C6CC] text-[#071013]"
                >
                    Staff Management
                </button>

                <button
                    onClick={() => navigate("/staff/attendance")}
                    className="px-5 py-2 rounded-xl font-semibold text-white hover:bg-[#1d1d1d]"
                >
                    Attendance
                </button>

            </div>

            {/* TABLE */}
            <div className="bg-[#1d1d1d] rounded-2xl p-4 h-[550px] flex flex-col">

                {/* HEADER */}
                <div
                    className="grid grid-cols-[40px_60px_220px_200px_150px_80px_100px_120px_120px]
                    text-gray-300 text-sm font-medium px-4 py-3"
                >
                    <div><input type="checkbox" /></div>
                    <div>ID</div>
                    <div>Name</div>
                    <div>Email</div>
                    <div>Phone</div>
                    <div>Age</div>
                    <div>Salary</div>
                    <div>Timings</div>
                    <div>Actions</div>
                </div>

                {/* SCROLLABLE ROW AREA */}
                <div className="flex-1 overflow-y-auto pr-2">

                    <div className="space-y-3 mt-2">

                        {staffData.map((staff) => (
                            <div
                                key={staff.id}
                                className="grid grid-cols-[40px_60px_220px_200px_150px_80px_100px_120px_120px]
                    items-center bg-[#2A2A2A] rounded-xl px-4 py-4 hover:bg-[#343434]"
                            >

                                <div>
                                    <input type="checkbox" />
                                </div>

                                <div className="text-white">
                                    {staff.id}
                                </div>

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

                                <div className="text-white text-sm">
                                    {staff.email}
                                </div>

                                <div className="text-white text-sm">
                                    {staff.phone}
                                </div>

                                <div className="text-white text-sm">
                                    {staff.age}
                                </div>

                                <div className="text-white text-sm">
                                    {staff.salary}
                                </div>

                                <div className="text-white text-sm">
                                    {staff.timings}
                                </div>

                                <div className="flex gap-3">

                                    <FiEye
                                        onClick={() =>
                                            navigate(`/staff/profile/${staff.id}`, {
                                                state: staff,
                                            })
                                        }
                                        className="text-white cursor-pointer hover:text-[#F5C6CC]"/>

                                    <FiEdit2 className="text-white hover:text-[#F5C6CC] cursor-pointer" />

                                    <FiTrash2 className="text-red-400 hover:text-red-500 cursor-pointer" />

                                </div>

                            </div>
                        ))}

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
                        className={`
                relative
                w-full sm:w-[85%] md:w-[60%] lg:w-[40%]
                h-full
                bg-[#1d1d1d]
                rounded-l-[32px]
                shadow-2xl
                transform transition-transform duration-300 ease-in-out
                flex flex-col
            `}
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

                        {/* BODY (SCROLLABLE) */}
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

                            {/* FORM GRID */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                <input placeholder="Full Name"
                                    className="h-[56px] bg-[#343434] rounded-[10px] px-4 placeholder-gray-600"
                                />

                                <input placeholder="Email"
                                    className="h-[56px] bg-[#343434] rounded-[10px] px-4 placeholder-gray-600"
                                />

                                <select className="h-[56px] bg-[#343434] rounded-[10px] px-4 text-gray-700">
                                    <option>Select Role</option>
                                    <option>Manager</option>
                                    <option>Chef</option>
                                    <option>Cashier</option>
                                </select>

                                <input placeholder="Phone Number"
                                    className="h-[56px] bg-[#343434] rounded-[10px] px-4 placeholder-gray-600"
                                />

                                <input placeholder="Salary"
                                    className="h-[56px] bg-[#343434] rounded-[10px] px-4 placeholder-gray-600"
                                />

                                <input type="date"
                                    className="h-[56px] bg-[#343434] rounded-[10px] px-4 text-gray-700"
                                />

                                <input placeholder="Shift Start"
                                    className="h-[56px] bg-[#343434] rounded-[10px] px-4 placeholder-gray-600"
                                />

                                <input placeholder="Shift End"
                                    className="h-[56px] bg-[#343434] rounded-[10px] px-4 placeholder-gray-600"
                                />

                                {/* FULL WIDTH */}
                                <div className="md:col-span-2">
                                    <input placeholder="Address"
                                        className="h-[56px] w-full bg-[#343434] rounded-[10px] px-4 placeholder-gray-600"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <textarea placeholder="Additional Details"
                                        className="h-[120px] w-full bg-[#343434] rounded-[12px] px-4 py-3 placeholder-gray-600"
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

export default StaffManagement