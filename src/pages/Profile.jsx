import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { FiUser, FiSettings, FiLogOut, FiEdit2 } from "react-icons/fi"
import { Eye, EyeOff } from "lucide-react"
import { useAuth } from "../hooks/useAuth"
import ManageAccess, { AddUserPanel } from "./ManageAccess"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { storage, db } from "../firebase/config"
import { doc, updateDoc, serverTimestamp } from "firebase/firestore"

function Profile() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const fileInputRef = useRef(null)

    const [activeTab, setActiveTab] = useState("profile") // "profile" | "access"

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        address: "",
        newPassword: "",
        confirmPassword: "",
    })

    const [avatarFile, setAvatarFile] = useState(null)
    const [avatarPreview, setAvatarPreview] = useState("")
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [saving, setSaving] = useState(false)
    const [feedback, setFeedback] = useState({ type: "", message: "" })

    // Populate the form once the authenticated user is available
    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || "",
                email: user.email || "",
                address: user.address || "",
                newPassword: "",
                confirmPassword: "",
            })
            setAvatarPreview(user.avatar || "https://i.pravatar.cc/150")
        }
    }, [user])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleAvatarClick = () => {
        fileInputRef.current?.click()
    }

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith("image/")) {
            setFeedback({ type: "error", message: "Please select a valid image file." })
            return
        }

        setAvatarFile(file)
        setAvatarPreview(URL.createObjectURL(file))
    }

    const handleDiscard = () => {
        if (!user) return
        setFormData({
            fullName: user.fullName || "",
            email: user.email || "",
            address: user.address || "",
            newPassword: "",
            confirmPassword: "",
        })
        setAvatarFile(null)
        setAvatarPreview(user.avatar || "https://i.pravatar.cc/150")
        setFeedback({ type: "", message: "" })
    }

    const handleSave = async () => {
        if (!user) return

        if (formData.newPassword || formData.confirmPassword) {
            if (formData.newPassword.length < 6) {
                setFeedback({ type: "error", message: "Password must be at least 6 characters." })
                return
            }
            if (formData.newPassword !== formData.confirmPassword) {
                setFeedback({ type: "error", message: "Passwords do not match." })
                return
            }
        }

        setSaving(true)
        setFeedback({ type: "", message: "" })``

        try {
            let avatarUrl = user.avatar || ""

            if (avatarFile) {
                const storageRef = ref(storage, `avatars/${user.uid}_${Date.now()}_${avatarFile.name}`)
                await uploadBytes(storageRef, avatarFile)
                avatarUrl = await getDownloadURL(storageRef)
            }

            await updateDoc(doc(db, "users", user.uid), {
                fullName: formData.fullName,
                email: formData.email,
                address: formData.address,
                avatar: avatarUrl,
                updatedAt: serverTimestamp(),
            })

            if (formData.newPassword) {
                await updateUserPassword(formData.newPassword)
            }

            setAvatarFile(null)
            setFormData((prev) => ({ ...prev, newPassword: "", confirmPassword: "" }))
            setFeedback({ type: "success", message: "Profile updated successfully." })
        } catch (error) {
            console.error("Update profile error:", error)
            setFeedback({
                type: "error",
                message: error.message || "Something went wrong. Please try again.",
            })
        } finally {
            setSaving(false)
        }
    }

    const handleLogout = async () => {
        await logout()
        navigate("/")
    }

    const tabs = [
        { id: "profile", label: "My Profile", icon: FiUser, onClick: () => setActiveTab("profile") },
        { id: "access", label: "Manage Access", icon: FiSettings, onClick: () => setActiveTab("access") },
        { id: "logout", label: "Logout", icon: FiLogOut, onClick: handleLogout },
    ]

    return (
        <div className="w-full">
            <div className="flex flex-col md:flex-row gap-6 items-start">

                {/* LEFT - TAB NAV */}
                <div className="w-full md:w-[260px] space-y-4">
                    <div className="bg-[#1d1d1d] rounded-2xl p-3 space-y-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon
                            const active = activeTab === tab.id

                            return (
                                <button
                                    key={tab.id}
                                    onClick={tab.onClick}
                                    className={`w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-200
                                        ${active
                                            ? "bg-[#F5C6CC] text-[#7D5B67]"
                                            : "text-white hover:bg-white/5"
                                        }`}
                                >
                                    <Icon size={16} />
                                    {tab.label}
                                </button>
                            )
                        })}
                    </div>

                    {activeTab === "access" && <AddUserPanel />}
                </div>

                {/* RIGHT - CONTENT */}
                <div className="w-full flex-1 bg-[#1d1d1d] rounded-2xl p-6 md:p-8">

                    {activeTab === "access" ? (
                        <ManageAccess />
                    ) : (
                        <>
                            <h2 className="text-xl md:text-2xl font-bold text-white mb-6">
                                Personal Information
                            </h2>

                            {feedback.message && (
                                <p className={`text-sm mb-4 ${feedback.type === "error" ? "text-red-400" : "text-green-400"}`}>
                                    {feedback.message}
                                </p>
                            )}

                            {/* AVATAR */}
                            <div className="flex items-center gap-4 mb-8">
                                <div className="relative w-24 h-24">
                                    <img
                                        src={avatarPreview || "https://i.pravatar.cc/150"}
                                        alt={formData.fullName}
                                        className="w-24 h-24 rounded-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAvatarClick}
                                        className="absolute bottom-0 right-0 w-7 h-7 bg-[#F5C6CC] rounded-full flex items-center justify-center text-[#7D5B67] hover:scale-105 transition-transform"
                                    >
                                        <FiEdit2 size={13} />
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        className="hidden"
                                    />
                                </div>

                                <div>
                                    <p className="text-white text-lg font-bold">{formData.fullName || "—"}</p>
                                    <p className="text-[#F5C6CC] text-sm capitalize">{user?.role || ""}</p>
                                </div>
                            </div>

                            {/* FORM */}
                            <div className="space-y-5">

                                <div>
                                    <label className="text-white text-sm font-medium block mb-2">First Name</label>
                                    <input
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className="w-full h-[56px] bg-[#343434] rounded-[10px] px-4 placeholder-gray-500 text-white focus:outline-none focus:ring-1 focus:ring-[#F5C6CC]/50"
                                    />
                                </div>

                                <div>
                                    <label className="text-white text-sm font-medium block mb-2">Email</label>
                                    <input
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full h-[56px] bg-[#343434] rounded-[10px] px-4 placeholder-gray-500 text-white focus:outline-none focus:ring-1 focus:ring-[#F5C6CC]/50"
                                    />
                                </div>

                                <div>
                                    <label className="text-white text-sm font-medium block mb-2">Address</label>
                                    <input
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="w-full h-[56px] bg-[#343434] rounded-[10px] px-4 placeholder-gray-500 text-white focus:outline-none focus:ring-1 focus:ring-[#F5C6CC]/50"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                    <div>
                                        <label className="text-white text-sm font-medium block mb-2">New Password</label>
                                        <div className="relative">
                                            <input
                                                name="newPassword"
                                                type={showNewPassword ? "text" : "password"}
                                                value={formData.newPassword}
                                                onChange={handleChange}
                                                placeholder="Leave blank to keep current"
                                                className="w-full h-[56px] bg-[#343434] rounded-[10px] px-4 pr-12 placeholder-gray-500 text-white focus:outline-none focus:ring-1 focus:ring-[#F5C6CC]/50"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#F5C6CC]"
                                            >
                                                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-white text-sm font-medium block mb-2">Confirm Password</label>
                                        <div className="relative">
                                            <input
                                                name="confirmPassword"
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                placeholder="Re-enter new password"
                                                className="w-full h-[56px] bg-[#343434] rounded-[10px] px-4 pr-12 placeholder-gray-500 text-white focus:outline-none focus:ring-1 focus:ring-[#F5C6CC]/50"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#F5C6CC]"
                                            >
                                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                </div>

                            </div>

                            {/* ACTIONS */}
                            <div className="flex items-center justify-end gap-6 mt-10">
                                <button
                                    type="button"
                                    onClick={handleDiscard}
                                    disabled={saving}
                                    className="text-white underline text-sm font-medium disabled:opacity-50"
                                >
                                    Discard Changes
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="bg-[#F5C6CC] text-[#7D5B67] font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </>
                    )}

                </div>

            </div>
        </div>
    )
}

export default Profile
