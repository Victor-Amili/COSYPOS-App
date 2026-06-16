import { useState, useEffect } from "react"
import { collection, onSnapshot } from "firebase/firestore"
import { db } from "../firebase/config"
import { FiEdit2, FiTrash2, FiCheck, FiX } from "react-icons/fi"
import { Eye, EyeOff } from "lucide-react"
import { useAuth } from "../hooks/useAuth"
import { createStaffUser, deleteUserAuth, updateUserPermissions } from "../services/authService"
import { updateStaffMember } from "../services/userService"
import CustomSelect from "../components/CustomSelect"

const PERMISSION_KEYS = [
    { key: "dashboard", label: "Dashboard" },
    { key: "reports", label: "Reports" },
    { key: "inventory", label: "Inventory" },
    { key: "orders", label: "Orders" },
    { key: "customers", label: "Customers" },
    { key: "settings", label: "Settings" },
]

const ROLE_OPTIONS = [
    { value: "admin", label: "Admin" },
    { value: "manager", label: "Manager" },
    { value: "sub-admin", label: "Sub Admin" },
    { value: "staff", label: "Staff" },
]

// Matches the defaults in usePermissions.js / the createStaffUser Cloud Function
const DEFAULT_PERMISSIONS = {
    dashboard: true,
    reports: false,
    inventory: false,
    orders: true,
    customers: false,
    settings: false,
}

const ROLE_BADGE_STYLES = {
    admin: "bg-[#F5C6CC] text-[#7D5B67]",
    manager: "bg-[#F5C6CC] text-[#7D5B67]",
}
const DEFAULT_BADGE_STYLE = "bg-white/10 text-white"

function Toggle({ checked, onChange }) {
    return (
        <button
            type="button"
            onClick={onChange}
            className={`w-11 h-6 rounded-full relative transition-colors duration-200 ${checked ? "bg-[#F5C6CC]" : "bg-[#3a3a3a]"
                }`}
        >
            <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0"
                    }`}
            />
        </button>
    )
}

/**
 * "Add New User" panel — rendered in Profile.jsx's LEFT column, under the tab nav,
 * matching the Figma layout. Backed by the createStaffUser Cloud Function, so it
 * creates a real Auth login without signing the current admin/manager out.*/
export function AddUserPanel() {
    const { user } = useAuth()
    const canAddUsers = user?.role === "admin" || user?.role === "manager"

    const [newUser, setNewUser] = useState({ fullName: "", email: "", role: "", password: "" })
    const [showPassword, setShowPassword] = useState(false)
    const [adding, setAdding] = useState(false)
    const [feedback, setFeedback] = useState({ type: "", message: "" })

    if (!canAddUsers) {
        return (
            <div className="bg-[#1d1d1d] rounded-2xl p-6 text-gray-400 text-sm">
                Only admins and managers can add new users.
            </div>
        )
    }

    const handleAddUser = async () => {
        if (!newUser.fullName || !newUser.email || !newUser.role || !newUser.password) {
            setFeedback({ type: "error", message: "Please fill in all fields." })
            return
        }
        if (newUser.password.length < 6) {
            setFeedback({ type: "error", message: "Password must be at least 6 characters." })
            return
        }

        setAdding(true)
        setFeedback({ type: "", message: "" })
        try {
            await createStaffUser(newUser)
            setNewUser({ fullName: "", email: "", role: "", password: "" })
            setFeedback({ type: "success", message: "User added successfully." })
        } catch (error) {
            console.error("Add user error:", error)
            setFeedback({ type: "error", message: error.message || "Failed to add user." })
        } finally {
            setAdding(false)
        }
    }

    return (
        <div className="bg-[#1d1d1d] rounded-2xl p-5">
            <h3 className="text-white text-base font-bold mb-4">Add New User</h3>

            {feedback.message && (
                <p className={`text-xs mb-3 ${feedback.type === "error" ? "text-red-400" : "text-green-400"}`}>
                    {feedback.message}
                </p>
            )}

            <div className="space-y-3">
                <input
                    placeholder="First Name"
                    value={newUser.fullName}
                    onChange={(e) => setNewUser((p) => ({ ...p, fullName: e.target.value }))}
                    className="w-full h-[48px] bg-[#343434] rounded-[10px] px-4 placeholder-gray-500 text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#F5C6CC]/50"
                />
                <input
                    placeholder="Email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))}
                    className="w-full h-[48px] bg-[#343434] rounded-[10px] px-4 placeholder-gray-500 text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#F5C6CC]/50"
                />

                <CustomSelect
                    placeholder="Role"
                    value={newUser.role}
                    onChange={(val) => setNewUser((p) => ({ ...p, role: val }))}
                    options={ROLE_OPTIONS}
                />

                <div className="relative">
                    <input
                        placeholder="Password"
                        type={showPassword ? "text" : "password"}
                        value={newUser.password}
                        onChange={(e) => setNewUser((p) => ({ ...p, password: e.target.value }))}
                        className="w-full h-[48px] bg-[#343434] rounded-[10px] px-4 pr-12 placeholder-gray-500 text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#F5C6CC]/50"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#F5C6CC]"
                    >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>

                <button
                    type="button"
                    onClick={handleAddUser}
                    disabled={adding}
                    className="w-full bg-[#F5C6CC] text-[#7D5B67] font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                    {adding ? "Adding..." : "Add"}
                </button>
            </div>
        </div>
    )
}

/**
 * User list with live permission toggles — rendered in Profile.jsx's RIGHT column.
 * Firestore rules only let admins write role/permissions on OTHER users' docs,
 * so this view (edit, delete, toggles) is gated to admins, even though
 * AddUserPanel above is open to managers too.
 */
function ManageAccess() {
    const { user } = useAuth()
    const isAdmin = user?.role === "admin"

    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState(null)
    const [editData, setEditData] = useState({ fullName: "", email: "", role: "" })
    const [feedback, setFeedback] = useState({ type: "", message: "" })

    useEffect(() => {
        const unsub = onSnapshot(collection(db, "users"), (snap) => {
            setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
            setLoading(false)
        })
        return () => unsub()
    }, [])

    if (!isAdmin) {
        return (
            <div className="text-gray-400 text-sm">
                Only admins can manage user permissions.
            </div>
        )
    }

    const handleTogglePermission = async (targetUser, key) => {
        const current = { ...DEFAULT_PERMISSIONS, ...targetUser.permissions }
        const updated = { ...current, [key]: !current[key] }
        try {
            await updateUserPermissions(targetUser.id, updated)
        } catch (error) {
            console.error("Toggle permission error:", error)
            setFeedback({ type: "error", message: "Failed to update permission." })
        }
    }

    const startEdit = (targetUser) => {
        setEditingId(targetUser.id)
        setEditData({
            fullName: targetUser.fullName || "",
            email: targetUser.email || "",
            role: targetUser.role || "staff",
        })
    }

    const saveEdit = async (id) => {
        try {
            await updateStaffMember(id, editData)
            setEditingId(null)
        } catch (error) {
            console.error("Edit user error:", error)
            setFeedback({ type: "error", message: "Failed to update user." })
        }
    }

    const handleDelete = async (targetUser) => {
        if (targetUser.id === user?.uid) return
        if (!window.confirm(`Remove ${targetUser.fullName}? This deletes their login too.`)) return
        try {
            await deleteUserAuth(targetUser.id)
        } catch (error) {
            console.error("Delete user error:", error)
            setFeedback({ type: "error", message: error.message || "Failed to delete user." })
        }
    }

    return (
        <div>
            {feedback.message && (
                <p className={`text-sm mb-4 ${feedback.type === "error" ? "text-red-400" : "text-green-400"}`}>
                    {feedback.message}
                </p>
            )}

            {loading ? (
                <div className="text-gray-500 text-sm py-8 text-center">Loading users...</div>
            ) : users.length === 0 ? (
                <div className="text-gray-500 text-sm py-8 text-center">No users found</div>
            ) : (
                <div className="divide-y divide-white/10">
                    {users.map((u) => {
                        const perms = { ...DEFAULT_PERMISSIONS, ...u.permissions }
                        const isEditing = editingId === u.id
                        const badgeStyle = ROLE_BADGE_STYLES[u.role] || DEFAULT_BADGE_STYLE
                        const isSelf = u.id === user?.uid

                        return (
                            <div key={u.id} className="py-5 first:pt-0">

                                <div className="flex items-start justify-between mb-1 gap-4 flex-wrap">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        {isEditing ? (
                                            <input
                                                value={editData.fullName}
                                                onChange={(e) => setEditData((p) => ({ ...p, fullName: e.target.value }))}
                                                className="bg-[#343434] rounded-lg px-3 py-1.5 text-white text-base font-bold focus:outline-none"
                                            />
                                        ) : (
                                            <h3 className="text-white text-lg font-bold">{u.fullName}</h3>
                                        )}

                                        {isEditing ? (
                                            <div className="w-36">
                                                <CustomSelect
                                                    value={editData.role}
                                                    onChange={(val) => setEditData((p) => ({ ...p, role: val }))}
                                                    options={ROLE_OPTIONS}
                                                />
                                            </div>
                                        ) : (
                                            <span className={`text-xs font-semibold px-3 py-1 rounded-lg capitalize ${badgeStyle}`}>
                                                {u.role}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {isEditing ? (
                                            <>
                                                <FiCheck onClick={() => saveEdit(u.id)} className="text-green-400 cursor-pointer hover:text-green-300" />
                                                <FiX onClick={() => setEditingId(null)} className="text-gray-400 cursor-pointer hover:text-white" />
                                            </>
                                        ) : (
                                            <>
                                                <FiEdit2 onClick={() => startEdit(u)} className="text-white hover:text-[#F5C6CC] cursor-pointer" />
                                                <FiTrash2
                                                    onClick={() => !isSelf && handleDelete(u)}
                                                    title={isSelf ? "You can't delete your own account" : "Delete user"}
                                                    className={isSelf ? "text-gray-600 cursor-not-allowed" : "text-red-400 hover:text-red-500 cursor-pointer"}
                                                />
                                            </>
                                        )}
                                    </div>
                                </div>

                                {isEditing ? (
                                    <input
                                        value={editData.email}
                                        onChange={(e) => setEditData((p) => ({ ...p, email: e.target.value }))}
                                        className="bg-[#343434] rounded-lg px-3 py-1.5 text-white text-sm mb-4 w-full md:w-80 focus:outline-none"
                                    />
                                ) : (
                                    <p className="text-[#F5C6CC] text-sm mb-4">{u.email}</p>
                                )}

                                <div className="flex flex-wrap gap-x-8 gap-y-3">
                                    {PERMISSION_KEYS.map(({ key, label }) => (
                                        <div key={key} className="flex flex-col gap-2 min-w-[90px]">
                                            <span className="text-white text-sm font-medium">{label}</span>
                                            <Toggle checked={!!perms[key]} onChange={() => handleTogglePermission(u, key)} />
                                        </div>
                                    ))}
                                </div>

                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default ManageAccess
