import { useLocation } from "react-router-dom"

function StaffProfile() {
    const location = useLocation()

    const employee = location.state || {}

    // Add computed fields for display
    const displayData = {
        name: employee.fullName || employee.name || "N/A",
        email: employee.email || "N/A",
        phone: employee.phone || "N/A",
        dob: employee.dateOfBirth || "N/A",
        address: employee.address || "N/A",
        role: employee.role || "N/A",
        salary: employee.salary ? `$${employee.salary}` : "N/A",
        timings: employee.timings || "N/A",
        image: employee.avatar || employee.image || "https://i.pravatar.cc/300"
    }

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
                            src={displayData.image || "https://i.pravatar.cc/300"}
                            alt={displayData.name}
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
                                        {displayData.name}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-pink-200 text-sm">Email</p>
                                    <p className="text-white text-lg">
                                        {displayData.email}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-pink-200 text-sm">Phone Number</p>
                                    <p className="text-white text-lg">
                                        {displayData.phone}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-pink-200 text-sm">Date of Birth</p>
                                    <p className="text-white text-lg">
                                        {displayData.dob}
                                    </p>
                                </div>

                            </div>

                            {/* ADDRESS */}
                            <div className="mt-6">
                                <p className="text-pink-200 text-sm">Address</p>
                                <p className="text-white text-lg">
                                    {displayData.address}
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
                                        {displayData.role}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-pink-200 text-sm">Salary</p>
                                    <p className="text-white text-lg">
                                        {displayData.salary}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-pink-200 text-sm">Shift timing</p>
                                    <p className="text-white text-lg">
                                        {displayData.timings}
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