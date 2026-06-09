import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) return setError("Email is required.");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return setError("Please enter a valid email.");

    setLoading(true);
    try {
      // ── Replace this block with your real password reset call ─────────
      // e.g. await sendPasswordResetEmail(auth, email);
      await new Promise((res) => setTimeout(res, 1000)); // simulate API
      setSuccess("Reset link sent! Check your inbox.");
      setEmail("");
      // ──────────────────────────────────────────────────────────────────
    } catch (err) {
      setError(err.message || "Failed to send reset email. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      {/* No top bar on Forgot Password screen — matches screenshot */}
      <div style={s.outer}>
        <div style={s.card}>
          <p style={s.brand}>COSYPOS</p>

          <div style={s.inner}>
            <h2 style={s.title}>Forgot your password?</h2>
            <p style={s.subtitle}>
              Enter your email address to receive a reset password link
            </p>

            {error && <p style={s.errorMsg}>{error}</p>}
            {success && <p style={s.successMsg}>{success}</p>}

            <form onSubmit={handleSubmit} noValidate>
              <div style={s.field}>
                <label style={s.label}>Email</label>
                <input
                  style={s.input}
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              <button type="submit" style={s.btnPink} disabled={loading}>
                {loading ? "Sending..." : "Send Email"}
              </button>
            </form>

            <p style={s.backText}>
              Back to{" "}
              <span style={s.backLink} onClick={() => navigate("/")}>
                Login?
              </span>
            </p>
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
    margin: "0 0 1rem 0",
  },
  inner: {
    backgroundColor: "#2e2e2e",
    borderRadius: "10px",
    padding: "1.25rem 1rem",
  },
  title: {
    textAlign: "center",
    fontSize: "13px",
    fontWeight: "600",
    color: "#f0f0f0",
    fontFamily: "'Poppins', sans-serif",
    margin: "0 0 4px 0",
  },
  subtitle: {
    textAlign: "center",
    fontSize: "9px",
    color: "#777",
    fontFamily: "'Poppins', sans-serif",
    margin: "0 0 1rem 0",
    lineHeight: "1.6",
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
  successMsg: {
    backgroundColor: "rgba(77,184,168,0.15)",
    border: "1px solid rgba(77,184,168,0.3)",
    color: "#4db8a8",
    fontSize: "10px",
    fontFamily: "'Poppins', sans-serif",
    borderRadius: "6px",
    padding: "7px 10px",
    marginBottom: "0.75rem",
    textAlign: "center",
  },
  field: {
    marginBottom: "0.75rem",
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
    marginTop: "0.25rem",
  },
  backText: {
    textAlign: "center",
    marginTop: "1rem",
    fontSize: "9px",
    color: "#777",
    fontFamily: "'Poppins', sans-serif",
  },
  backLink: {
    color: "#e88fa0",
    cursor: "pointer",
  },
};
