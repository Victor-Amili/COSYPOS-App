import { useState, useEffect } from "react"
import { FiEye, FiEdit2, FiTrash2, FiChevronDown } from "react-icons/fi"
import { useNavigate, useLocation } from "react-router-dom"
import { db } from "../firebase/config"
import { collection, onSnapshot, doc, deleteDoc, addDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";

function StaffManagement() {
    const navigate = useNavigate()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const location = useLocation()
    const [staffList, setStaffList] = useState([])
    const [loading, setLoading] = useState(true)
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        role: "",
        phone: "",
        salary: "",
        dateOfBirth: "",
        timings: "",
        address: "",
        additionalDetails: "",
        avatar: "",
        adminPassword: ""
    })

    useEffect(() => {
        const params = new URLSearchParams(location.search)
        if (params.get("add") === "true") {
            setIsModalOpen(true)
            // Clean the URL so refresh doesn't reopen modal
            navigate("/staff", { replace: true })
        }
    }, [location.search, navigate])

    // Fetch staff from Firebase
    useEffect(() => {
        const unsub = onSnapshot(collection(db, "users"), (snap) => {
            const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
            setStaffList(data)
            setLoading(false)
        })
        return () => unsub()
    }, [])




    // Handle form input changes
    const handleInputChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    // Delete staff from Firebase
    const handleDeleteStaff = async (id) => {
        if (!window.confirm("Delete this staff member?")) return
        try {
            await deleteDoc(doc(db, "users", id))
        } catch (error) {
            console.error("Delete error:", error)
            alert("Failed to delete staff")
        }
    }

const handleAddStaff = async () => {
    // Validate all required fields
    if (!formData.fullName || !formData.email || !formData.password || !formData.role || !formData.adminPassword) {
        alert("Please fill in: Name, Email, Staff Password, Role, Your Admin Password")
        return
    }

    // 🔥 CAPTURE ADMIN EMAIL BEFORE WE GET LOGGED OUT
    const adminEmail = auth.currentUser?.email;

    try {
        // 1. Create Firebase Auth user → gets uid
        // ⚠️ THIS LOGS OUT ADMIN AND LOGS IN NEW STAFF
        const userCredential = await createUserWithEmailAndPassword(
            auth, 
            formData.email, 
            formData.password
        );
        const { uid } = userCredential.user;

        // 2. Create Firestore document WITH SAME UID as document ID
        await setDoc(doc(db, "users", uid), {
            uid: uid,
            fullName: formData.fullName,
            email: formData.email,
            role: formData.role,
            phone: formData.phone,
            salary: parseFloat(formData.salary) || 0,
            dateOfBirth: formData.dateOfBirth,
            timings: formData.timings,
            address: formData.address,
            additionalDetails: formData.additionalDetails,
            avatar: formData.avatar || "",
            permissions: {
                dashboard: true,
                reports: formData.role === "Manager" || formData.role === "Admin",
                inventory: true,
                orders: true,
                customers: true,
                settings: formData.role === "Manager" || formData.role === "Admin"
            },
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        // 3. Create notification
        await addDoc(collection(db, "notifications"), {
            title: "New Staff Added",
            message: `${formData.fullName} joined as ${formData.role}`,
            type: "staff",
            read: false,
            createdAt: serverTimestamp(),
        });

        // 4. Reset form and close modal
        setIsModalOpen(false);
        setFormData({
            fullName: "", email: "", password: "", adminPassword: "", role: "", phone: "", salary: "",
            dateOfBirth: "", timings: "", address: "", additionalDetails: "", avatar: ""
        });

        // 5. 🔥 RE-LOGIN AS ADMIN
        // createUserWithEmailAndPassword logged us out, so we log back in
        if (adminEmail && formData.adminPassword) {
            try {
                await signInWithEmailAndPassword(auth, adminEmail, formData.adminPassword);
                console.log("✅ Admin re-logged in successfully");
            } catch (reloginErr) {
                console.error("❌ Admin re-login failed:", reloginErr);
                alert("Staff created, but admin session lost. Please log in again.");
                // Optional: redirect to login
                // navigate("/");
                return;
            }
        }

        alert(`✅ Staff created successfully!\nEmail: ${formData.email}\nPassword: ${formData.password}`);

    } catch (error) {
        console.error("Add error:", error);
        alert("Failed to add staff: " + error.message);
        
        // 🔥 TRY TO RE-LOGIN ADMIN EVEN ON ERROR
        if (adminEmail && formData.adminPassword) {
            try {
                await signInWithEmailAndPassword(auth, adminEmail, formData.adminPassword);
                console.log("✅ Admin re-logged in after error");
            } catch (reloginErr) {
                console.error("❌ Failed to re-login admin after error:", reloginErr);
                alert("Admin session lost. Please log in again.");
            }
        }
    }
};

    return (
        <div className="space-y-6">

            {/* TOP SECTION */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                <h1 className="text-white text-2xl font-bold">
                    Staff ({staffList.length})
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

                        {loading ? (
                            <div className="text-center py-12 text-gray-500">Loading staff...</div>
                        ) : staffList.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">No staff found</div>
                        ) : (
                            staffList.map((staff) => (
                                <div
                                    key={staff.id}
                                    className="grid grid-cols-[40px_60px_220px_200px_150px_80px_100px_120px_120px]
                    items-center bg-[#2A2A2A] rounded-xl px-4 py-4 hover:bg-[#343434]"
                                >

                                    <div>
                                        <input type="checkbox" />
                                    </div>

                                    <div className="text-white">
                                        #{String(staffList.indexOf(staff) + 1).padStart(3, '0')}
                                    </div>
                                    <div className="flex items-center gap-3">

                                        <img
                                            src={staff.avatar || "https://i.pravatar.cc/150?img=1"}
                                            alt={staff.fullName}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />

                                        <div>
                                            <h3 className="text-white font-semibold text-sm">
                                                {staff.fullName}
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
                                        {staff.dateOfBirth ? (() => {
                                            const dob = staff.dateOfBirth?.toDate ? staff.dateOfBirth.toDate() : new Date(staff.dateOfBirth)
                                            const age = new Date().getFullYear() - dob.getFullYear()
                                            return age + " yr"
                                        })() : "N/A"}
                                    </div>

                                    <div className="text-white text-sm">
                                        ${typeof staff.salary === 'number' ? staff.salary.toFixed(2) : staff.salary}
                                    </div>

                                    <div className="text-white text-sm">
                                        {staff.timings ? `${staff.timings}` : "N/A"}
                                    </div>

                                    <div className="flex gap-3">

                                        <FiEye
                                            onClick={() =>
                                                navigate(`/staff/profile/${staff.id}`, {
                                                    state: staff,
                                                })
                                            }
                                            className="text-white cursor-pointer hover:text-[#F5C6CC]" />

                                        <FiEdit2 className="text-white hover:text-[#F5C6CC] cursor-pointer" />

                                        <FiTrash2
                                            onClick={() => handleDeleteStaff(staff.id)}
                                            className="text-red-400 hover:text-red-500 cursor-pointer"
                                        />

                                    </div>

                                </div>
                            )))}

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

                                <input
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    placeholder="Full Name"
                                    className="h-[56px] bg-[#343434] rounded-[10px] px-4 placeholder-gray-600 text-white"
                                />

                                <input
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Email"
                                    className="h-[56px] bg-[#343434] rounded-[10px] px-4 placeholder-gray-600 text-white"
                                />

                                <input
                                    name="password"
                                    type="password"
                                    value={formData.password || ""}
                                    onChange={handleInputChange}
                                    placeholder="Initial Password"
                                    className="h-[56px] bg-[#343434] rounded-[10px] px-4 placeholder-gray-600 text-white"
                                />

                                <input
                                    name="adminPassword"
                                    type="password"
                                    value={formData.adminPassword || ""}
                                    onChange={handleInputChange}
                                    placeholder="Your Admin Password (for re-login)"
                                    className="h-[56px] bg-[#343434] rounded-[10px] px-4 placeholder-gray-600 text-white"
                                />

                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    className="h-[56px] bg-[#343434] rounded-[10px] px-4 text-gray-300"
                                >
                                    <option value="">Select Role</option>
                                    <option value="Manager">Manager</option>
                                    <option value="Chef">Chef</option>
                                    <option value="Cashier">Cashier</option>
                                    <option value="Supervisor">Supervisor</option>
                                    <option value="Waitress">Waitress</option>
                                    <option value="Receptionist">Receptionist</option>
                                </select>

                                <input
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="Phone Number"
                                    className="h-[56px] bg-[#343434] rounded-[10px] px-4 placeholder-gray-600 text-white"
                                />

                                <input
                                    name="salary"
                                    value={formData.salary}
                                    onChange={handleInputChange}
                                    placeholder="Salary"
                                    className="h-[56px] bg-[#343434] rounded-[10px] px-4 placeholder-gray-600 text-white"
                                />

                                <input
                                    name="dateOfBirth"
                                    value={formData.dateOfBirth}
                                    onChange={handleInputChange}
                                    type="date"
                                    className="h-[56px] bg-[#343434] rounded-[10px] px-4 text-gray-700"
                                />

                                <input
                                    name="timings"
                                    value={formData.timings}
                                    onChange={handleInputChange}
                                    placeholder="Shift Timings (e.g. 9am-5pm)"
                                    className="h-[56px] bg-[#343434] rounded-[10px] px-4 placeholder-gray-600 text-white"
                                />

                                {/* FULL WIDTH */}
                                <input
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    placeholder="Address"
                                    className="h-[56px] w-full bg-[#343434] rounded-[10px] px-4 placeholder-gray-600 text-white"
                                />

                                <textarea
                                    name="additionalDetails"
                                    value={formData.additionalDetails}
                                    onChange={handleInputChange}
                                    placeholder="Additional Details"
                                    className="h-[120px] w-full bg-[#343434] rounded-[12px] px-4 py-3 placeholder-gray-600 text-white"
                                />

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

                            <button
                                onClick={handleAddStaff}
                                className="w-[140px] h-[56px] bg-[#F4C7D7] text-[#0F0F0F] font-semibold rounded-[12px]"
                            >
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