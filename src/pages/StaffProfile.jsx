import { useLocation, useNavigate } from "react-router-dom"
import { useState } from "react"
import { doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore"
import { db } from "../firebase/config"

function StaffProfile() {
    const location = useLocation()
    const navigate = useNavigate()
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

     const [isEditing, setIsEditing] = useState(false)
    const [editData, setEditData] = useState({ ...displayData })

    const handleEdit = () => {
        setIsEditing(true)
        setEditData({ ...displayData })
    }

    const handleSave = async () => {
        try {
            await updateDoc(doc(db, "users", employee.id), {
                fullName: editData.name,
                email: editData.email,
                phone: editData.phone,
                dateOfBirth: editData.dob,
                address: editData.address,
                role: editData.role,
                salary: editData.salary.replace("$", ""),
                timings: editData.timings,
                updatedAt: serverTimestamp()
            })
            setIsEditing(false)
            alert("Profile updated!")
        } catch (error) {
            console.error("Update error:", error)
            alert("Failed to update: " + error.message)
        }
    }

    const handleDelete = async () => {
        if (!window.confirm(`Delete ${displayData.name}?`)) return
        try {
            await deleteDoc(doc(db, "users", employee.id))
            alert("Profile deleted!")
            navigate("/staff")
        } catch (error) {
            console.error("Delete error:", error)
            alert("Failed to delete: " + error.message)
        }
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


                    {isEditing ? (
                        <button onClick={handleSave} className="w-full h-[60px] bg-[#F5C6CC] text-[#7D5B67] rounded-2xl font-semibold">
                            Save Changes
                        </button>
                    ) : (
                        <button onClick={handleEdit} className="w-full h-[60px] border-2 border-[#F5C6CC] rounded-2xl text-white hover:bg-[#F5C6CC] hover:text-[#7D5B67] transition-colors duration-200 font-semibold">
                            Edit Profile
                        </button>
                    )}

                    <button onClick={handleDelete} className="w-full h-[60px] border-2 border-[#F5C6CC] rounded-2xl 
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
                                    {isEditing ? (
                                        <input
                                            value={editData.name}
                                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                            className="bg-[#2a2a2a] text-white rounded-lg px-3 py-1 w-full"
                                        />
                                    ) : (
                                        <p className="text-white text-lg">{displayData.name}</p>
                                    )}
                                </div>

                                <div>
                                    <p className="text-pink-200 text-sm">Email</p>
                                    {isEditing ? (
                                        <input
                                            value={editData.email}
                                            onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                            className="bg-[#2a2a2a] text-white rounded-lg px-3 py-1 w-full"
                                        />
                                    ) : (
                                        <p className="text-white text-lg">{displayData.email}</p>
                                    )}
                                </div>

                                <div>
                                    <p className="text-pink-200 text-sm">Phone Number</p>
                                    {isEditing ? (
                                        <input
                                            value={editData.phone}
                                            onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                                            className="bg-[#2a2a2a] text-white rounded-lg px-3 py-1 w-full"
                                        />
                                    ) : (
                                        <p className="text-white text-lg">{displayData.phone}</p>
                                    )}
                                </div>

                                <div>
                                    <div>
                                        <p className="text-pink-200 text-sm">Date Of Birth</p>
                                        {isEditing ? (
                                            <input
                                                value={editData.dob}
                                                onChange={(e) => setEditData({ ...editData, dob: e.target.value })}
                                                className="bg-[#2a2a2a] text-white rounded-lg px-3 py-1 w-full"
                                            />
                                        ) : (
                                            <p className="text-white text-lg">{displayData.dob}</p>
                                        )}
                                    </div>
                                </div>

                            </div>

                            <div>
                                <p className="text-pink-200 text-sm">Adress</p>
                                {isEditing ? (
                                    <input
                                        value={editData.address}
                                        onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                                        className="bg-[#2a2a2a] text-white rounded-lg px-3 py-1 w-full"
                                    />
                                ) : (
                                    <p className="text-white text-lg">{displayData.address}</p>
                                )}
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
                                    {isEditing ? (
                                        <input
                                            value={editData.role}
                                            onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                                            className="bg-[#2a2a2a] text-white rounded-lg px-3 py-1 w-full"
                                        />
                                    ) : (
                                        <p className="text-white text-lg">{displayData.role}</p>
                                    )}
                                </div>

                                <div>
                                    <p className="text-pink-200 text-sm">Salary</p>
                                    {isEditing ? (
                                        <input
                                            value={editData.salary}
                                            onChange={(e) => setEditData({ ...editData, salary: e.target.value })}
                                            className="bg-[#2a2a2a] text-white rounded-lg px-3 py-1 w-full"
                                        />
                                    ) : (
                                        <p className="text-white text-lg">{displayData.salary}</p>
                                    )}
                                </div>

                                <div>
                                    <p className="text-pink-200 text-sm">Shift Timing</p>
                                    {isEditing ? (
                                        <input
                                            value={editData.timings}
                                            onChange={(e) => setEditData({ ...editData, timings: e.target.value })}
                                            className="bg-[#2a2a2a] text-white rounded-lg px-3 py-1 w-full"
                                        />
                                    ) : (
                                        <p className="text-white text-lg">{displayData.timings}</p>
                                    )}
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