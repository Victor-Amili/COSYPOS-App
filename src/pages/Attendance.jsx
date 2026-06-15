import { useState, useEffect } from "react"
import { FiChevronDown, FiEdit2 } from "react-icons/fi"
import { useNavigate } from "react-router-dom"
import { db } from "../firebase/config"
import { collection, onSnapshot, doc, setDoc, query, where, getDocs, serverTimestamp } from "firebase/firestore"


const formatDisplayDate = (ymd) => {
    if (!ymd) return ""
    const [year, month, day] = ymd.split("-")
    const date = new Date(year, month - 1, day)
    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    })
}

function Attendance() {
    const navigate = useNavigate()

    const today = new Date().toISOString().split("T")[0]

    const [staffList, setStaffList] = useState([])
    const [attendanceRecords, setAttendanceRecords] = useState({})
    const [loading, setLoading] = useState(true)
    const [selectedDate, setSelectedDate] = useState(today)

    const updateStatus = async (staffId, status) => {
        const attendanceId = `${staffId}_${selectedDate}`  // no replace needed, date has no spaces
        try {
            await setDoc(doc(db, "attendance", attendanceId), {
                staffId,
                date: selectedDate,
                status: status || null,
                updatedAt: serverTimestamp(),
                createdAt: serverTimestamp(),
            })
            // Update local state immediately for instant UI feedback
            setAttendanceRecords(prev => ({
                ...prev,
                [staffId]: { id: attendanceId, staffId, date: selectedDate, status: status || null }
            }))
        } catch (error) {
            console.error("Error saving attendance:", error)
            alert("Failed to save attendance")
        }
    }

    // Fetch all staff from users collection
    useEffect(() => {
        const unsub = onSnapshot(collection(db, "users"), (snap) => {
            const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
            setStaffList(data)
            setLoading(false)
        })
        return () => unsub()
    }, [])

    // Fetch attendance records for selected date
    useEffect(() => {
        const fetchAttendance = async () => {
            const q = query(
                collection(db, "attendance"),
                where("date", "==", selectedDate)
            )
            const snap = await getDocs(q)
            const records = {}
            snap.docs.forEach((d) => {
                const data = d.data()
                records[data.staffId] = { id: d.id, ...data }
            })
            setAttendanceRecords(records)
        }
        fetchAttendance()
    }, [selectedDate])

    return (
        <div className="space-y-6">

            {/* TOP SECTION */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                <h1 className="text-white text-2xl font-bold">
                    Staff ({staffList.length})
                </h1>

                <div className="flex flex-wrap items-center gap-3">

                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="bg-[#1d1d1d] text-white px-4 py-2 rounded-xl border border-white/10 text-sm"
                    />

                    <button
                        onClick={() => navigate("/staff?add=true")}
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

                            {loading ? (
                                <div className="text-center py-12 text-gray-500">Loading staff...</div>
                            ) : staffList.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">No staff found</div>
                            ) : (
                                staffList.map((staff, index) => {
                                    const attendance = attendanceRecords[staff.id]
                                    const status = attendance?.status || null

                                    return (


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
                                                <div className="text-white">
                                                    {staff.staffId || `#${String(staffList.indexOf(staff) + 1).padStart(3, '0')}`}
                                                </div>
                                            </div>

                                            {/* NAME */}
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

                                            {/* DATE */}
                                            <div className="text-white text-sm">
                                                {formatDisplayDate(selectedDate)}
                                            </div>

                                            {/* TIMINGS */}
                                            <div className="text-white text-sm">
                                                {staff.shiftStart && staff.shiftEnd ? `${staff.shiftStart} to ${staff.shiftEnd}` : staff.timings || "N/A"}

                                            </div>

                                            {/* STATUS */}
                                            <div>

                                                {!status ? (

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
                                                            {status || "No Status"}
                                                        </span>

                                                        <FiEdit2 size={14} />

                                                    </button>

                                                )}

                                            </div>

                                        </div>

                                    )
                                }
                                )
                            )}

                        </div>

                    </div>

                </div>

            </div>
        </div>
    )
}

export default Attendance