import { useLocation } from "react-router-dom"

function StaffProfile() {
    const location = useLocation()

    const employee = location.state || {}

    return (
        <div className="w-full min-h-full  p-10">


            <div className="flex items-center justify-between mt-[-1rem] mb-6">

                <h1 className="text-2xl md:text-3xl font-bold text-white">
                    Profile Image
                </h1>

            </div>

            {/* MAIN LAYOUT */}
            <div className="flex flex-col lg:flex-row gap-10">

                {/* LEFT COLUMN */}
                <div className="lg:w-[30%] w-full space-y-6">

                    {/* IMAGE CARD */}
                    <div className="bg-white rounded-2xl overflow-hidden h-[350px] flex items-center justify-center">
                        <img
                            src={employee.image || "https://i.pravatar.cc/300"}
                            alt={employee.name}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* CHANGE IMAGE */}
                    <p className="text-pink-300 underline text-sm cursor-pointer">
                        Change Profile Picture
                    </p>

                    {/* BUTTONS */}
                    <button className="w-full h-[60px]  rounded-2xl hover:bg-[#F5C6CC] hover:text-[#7D5B67] 
                    transition-colors duration-200] font-semibold border-2 border-[#F5C6CC]">
                        Edit Profile
                    </button>

                    <button className="w-full h-[60px] border-2 border-[#F5C6CC] rounded-2xl 
                    text-white hover:bg-[#F5C6CC] hover:text-[#7D5B67] transition-colors duration-200">
                        Delete Profile
                    </button>

                </div>

                {/* RIGHT COLUMN */}
                <div className="lg:w-[70%] w-full mt-[-4rem] space-y-10">

                    {/* PERSONAL DETAILS */}
                    <div>

                        <h2 className="text-white text-3xl font-bold mb-6">
                            Employee Personal Details
                        </h2>

                        <div className="bg-[#343434] rounded-2xl p-4">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                <div>
                                    <p className="text-pink-200 text-sm">Full Name</p>
                                    <p className="text-white text-lg">
                                        {employee.name || "N/A"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-pink-200 text-sm">Email</p>
                                    <p className="text-white text-lg">
                                        {employee.email || "N/A"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-pink-200 text-sm">Phone Number</p>
                                    <p className="text-white text-lg">
                                        {employee.phone || "N/A"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-pink-200 text-sm">Date of Birth</p>
                                    <p className="text-white text-lg">
                                        {employee.dob || "N/A"}
                                    </p>
                                </div>

                            </div>

                            {/* ADDRESS */}
                            <div className="mt-6">
                                <p className="text-pink-200 text-sm">Address</p>
                                <p className="text-white text-lg">
                                    {employee.address || "N/A"}
                                </p>
                            </div>

                        </div>

                    </div>

                    {/* JOB DETAILS */}
                    <div>

                        <h2 className="text-white text-3xl font-bold mb-6">
                            Employee Job Details
                        </h2>

                        <div className="bg-[#343434] rounded-3xl p-9">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                <div>
                                    <p className="text-pink-200 text-sm">Role</p>
                                    <p className="text-white text-lg">
                                        {employee.role || "N/A"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-pink-200 text-sm">Salary</p>
                                    <p className="text-white text-lg">
                                        {employee.salary || "N/A"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-pink-200 text-sm">Shift Start</p>
                                    <p className="text-white text-lg">
                                        {employee.shiftStart || "N/A"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-pink-200 text-sm">Shift End</p>
                                    <p className="text-white text-lg">
                                        {employee.shiftEnd || "N/A"}
                                    </p>
                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    )
}

export default StaffProfile