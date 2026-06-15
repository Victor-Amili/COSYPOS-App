import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) return setError("Username is required.");
    if (!password.trim()) return setError("Password is required.");

    setLoading(true);
    try {
      // ── Replace this block with your real auth call ──────────────────
      // e.g. await signInWithEmailAndPassword(auth, username, password);
      await new Promise((res) => setTimeout(res, 1000)); // simulate API
      if (username === "paul" && password === "paulino22") {
        if (rememberMe) localStorage.setItem("cosypos_user", username);
        navigate("/dashboard");
      } else {
        setError("Invalid username or password.");
      }
      // ─────────────────────────────────────────────────────────────────
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      {/* Top bar — only on Login screen */}
      <div style={s.topBar}>
        <span style={s.topBarText}>Login</span>
      </div>

      <div style={s.outer}>
        <div style={s.card}>
          <p style={s.brand}>COSYPOS</p>

          <div style={s.inner}>
            <h2 style={s.title}>Login!</h2>
            <p style={s.subtitle}>Please use your credentials to login</p>

            {error && <p style={s.errorMsg}>{error}</p>}

            <form onSubmit={handleLogin} noValidate>
              <div style={s.field}>
                <label style={s.label}>Username</label>
                <input
                  style={s.input}
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </div>

              <div style={s.field}>
                <label style={s.label}>Password</label>
                <div style={s.pwWrap}>
                  <input
                    style={{ ...s.input, paddingRight: "36px" }}
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    style={s.eyeBtn}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      // eye-off icon
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      // eye icon
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div style={s.row}>
                <label style={s.rememberLabel}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={s.checkbox}
                  />
                  Remember me
                </label>
                <span style={s.forgotLink} onClick={() => navigate("/forgot-password")}>
                  Forgot Password?
                </span>
              </div>

              <button type="submit" style={s.btnPink} disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#1c1c1c",
    display: "flex",
    flexDirection: "column",
  },
  topBar: {
    backgroundColor: "#4db8a8",
    padding: "14px 20px",
  },
  topBarText: {
    color: "#fff",
    fontSize: "20px",
    fontWeight: "500",
    fontFamily: "'Poppins', sans-serif",
  },
  outer: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem 1rem",
  },
  card: {
    backgroundColor: "#242424",
    borderRadius: "14px",
    padding: "1.75rem 1.5rem",
    width: "100%",
    maxWidth: "300px",
  },
  brand: {
    textAlign: "center",
    fontSize: "13px",
    fontWeight: "700",
    letterSpacing: "3px",
    color: "#4db8a8",
    fontFamily: "'Poppins', sans-serif",
    marginBottom: "1rem",
    margin: "0 0 1rem 0",
  },
  inner: {
    backgroundColor: "#2e2e2e",
    borderRadius: "10px",
    padding: "1.25rem 1rem",
  },
  title: {
    textAlign: "center",
    fontSize: "14px",
    fontWeight: "600",
    color: "#f0f0f0",
    fontFamily: "'Poppins', sans-serif",
    margin: "0 0 3px 0",
  },
  subtitle: {
    textAlign: "center",
    fontSize: "9px",
    color: "#777",
    fontFamily: "'Poppins', sans-serif",
    margin: "0 0 1rem 0",
    lineHeight: "1.5",
  },
  errorMsg: {
    backgroundColor: "rgba(232,143,160,0.15)",
    border: "1px solid rgba(232,143,160,0.3)",
    color: "#e88fa0",
    fontSize: "10px",
    fontFamily: "'Poppins', sans-serif",
    borderRadius: "6px",
    padding: "7px 10px",
    marginBottom: "0.75rem",
    textAlign: "center",
  },
  field: {
    marginBottom: "0.65rem",
  },
  label: {
    display: "block",
    fontSize: "9px",
    color: "#999",
    fontFamily: "'Poppins', sans-serif",
    marginBottom: "4px",
  },
  input: {
    width: "100%",
    height: "32px",
    backgroundColor: "#3a3a3a",
    border: "0.5px solid #4a4a4a",
    borderRadius: "6px",
    padding: "0 10px",
    fontFamily: "'Poppins', sans-serif",
    fontSize: "10px",
    color: "#f0f0f0",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
  },
  pwWrap: {
    position: "relative",
  },
  eyeBtn: {
    position: "absolute",
    right: "8px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    display: "flex",
    alignItems: "center",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    margin: "0.5rem 0 0.9rem",
  },
  rememberLabel: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "9px",
    color: "#888",
    fontFamily: "'Poppins', sans-serif",
    cursor: "pointer",
  },
  checkbox: {
    width: "11px",
    height: "11px",
    accentColor: "#e88fa0",
    cursor: "pointer",
  },
  forgotLink: {
    fontSize: "9px",
    color: "#e88fa0",
    fontFamily: "'Poppins', sans-serif",
    cursor: "pointer",
  },
  btnPink: {
    width: "100%",
    height: "32px",
    backgroundColor: "#e88fa0",
    border: "none",
    borderRadius: "6px",
    fontFamily: "'Poppins', sans-serif",
    fontSize: "11px",
    fontWeight: "500",
    color: "#fff",
    cursor: "pointer",
    transition: "opacity 0.15s",
  },
};
