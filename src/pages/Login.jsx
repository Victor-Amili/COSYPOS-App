import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import { Eye, EyeOff } from "lucide-react";  // 🔥 Import eye icons

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);  // 🔥 Toggle state
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await loginUser(email, password);
      navigate("/dashboard");
    } catch (err) {
      const friendlyMessages = {
        "auth/invalid-credential": "Invalid email or password. Please try again.",
        "auth/user-not-found": "No account found with this email.",
        "auth/wrong-password": "Incorrect password.",
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/too-many-requests": "Too many failed attempts. Please try again later.",
        "auth/user-disabled": "This account has been disabled.",
      };
      setError(friendlyMessages[err.code] || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-[#0F0F0F]">
      <div className="bg-[#1d1d1d] rounded-3xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-[#F5C6CC] text-center mb-2">COSYPOS</h1>
        <h2 className="text-lg text-white text-center mb-6">Login!</h2>

        {error && (
          <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="text-xs text-gray-400 block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 bg-[#2a2a2a] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#F5C6CC]/50"
              required
            />
          </div>

          {/* Password with Eye Icon */}
          <div>
            <label className="text-xs text-gray-400 block mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}  // 🔥 Toggle type
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 pr-12 bg-[#2a2a2a] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#F5C6CC]/50"
                required
              />
              {/* Eye Icon Button */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#F5C6CC] transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me + Forgot Password */}
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-gray-400">
              <input type="checkbox" className="rounded bg-[#2a2a2a] border-white/10" />
              Remember me
            </label>
            <button 
              type="button" 
              onClick={() => navigate("/forgot-password")} 
              className="text-[#F5C6CC] hover:text-[#7D5B67] transition"
            >
              Forgot Password?
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#F5C6CC] text-[#7D5B67] rounded-xl text-sm font-semibold hover:bg-[#F5C6CC]/80 transition-all disabled:opacity-50"
          >
            {loading ? "Loading..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;