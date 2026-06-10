// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-[#0a0a0a]">
      <div className="bg-[#1e1e1e] rounded-3xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-white text-center mb-2">COSYPOS</h1>
        <h2 className="text-lg text-white text-center mb-6">Login!</h2>
        
        {error && (
          <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Username</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your username"
              className="w-full px-4 py-3 bg-[#2a2a2a] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-pink-400/50"
              required
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 bg-[#2a2a2a] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-pink-400/50"
              required
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-gray-400">
              <input type="checkbox" className="rounded bg-[#2a2a2a] border-white/10" />
              Remember me
            </label>
            <button type="button" className="text-pink-400 hover:text-pink-300">
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-pink-400 text-white rounded-xl text-sm font-medium hover:bg-pink-500 transition-all disabled:opacity-50"
          >
            {loading ? "Loading..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;