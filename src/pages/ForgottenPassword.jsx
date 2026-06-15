import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { auth } from "../firebase/config"
import { sendPasswordResetEmail } from "firebase/auth"


export default function ForgottenPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) {
      setError("Please enter your email")
      return
    }
    setLoading(true)
    setError("")
    setMessage("")
    
    try {
      await sendPasswordResetEmail(auth, email)
      setMessage("Password reset email sent! Check your inbox.")
      setEmail("")
    } catch (err) {
      console.error("Reset error:", err)
      setError(getErrorMessage(err.code))
    } finally {
      setLoading(false)
    }
  }

  const getErrorMessage = (code) => {
    switch (code) {
      case "auth/user-not-found":
        return "No account found with this email"
      case "auth/invalid-email":
        return "Invalid email address"
      case "auth/too-many-requests":
        return "Too many attempts. Please try again later"
      default:
        return "Failed to send reset email. Try again"
    }
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1d1d1d] rounded-2xl p-6 sm:p-8 border border-white/5">
        
        {/* Header */}
        <h1 className="text-[#F5C6CC] text-2xl font-bold mb-2">Forgot Password?</h1>
        <p className="text-gray-400 text-sm mb-6">
          Enter your email and we'll send you a link to reset your password
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email */}
          <div>
            <label className="text-gray-400 text-xs mb-1.5 block">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#F5C6CC]/60 transition text-sm"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">
              <p className="text-red-400 text-xs">{error}</p>
            </div>
          )}

          {/* Success */}
          {message && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-2.5">
              <p className="text-green-400 text-xs">{message}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#F5C6CC] text-[#7D5B67] font-semibold py-3 rounded-xl hover:bg-[#F5C6CC]/80 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

        </form>

        {/* Back to login */}
        <button
          onClick={() => navigate("/")}
          className="w-full mt-4 text-gray-400 text-sm hover:text-[#F5C6CC] transition"
        >
          ← Back to Login
        </button>

      </div>
    </div>
  )
}