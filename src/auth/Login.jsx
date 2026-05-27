import { useState } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase.js";
import { IcoGoogle } from "../icons.jsx";
import "../scss/auth.scss";

// ── Local bypass credentials (use while Firebase Auth is being set up) ──
const LOCAL_EMAIL = "admin@qrmenu.local";
const LOCAL_PASS  = "admin123";
const LOCAL_KEY   = "qrmenu_local_auth";

export default function Login({ onSwitch, onSuccess }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPwd, setShowPwd]   = useState(false);
  const [showHint, setShowHint] = useState(false);

  const clearError = () => setError("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError("Please fill in all fields."); return; }

    // ── Local bypass ──
    if (email.trim() === LOCAL_EMAIL && password === LOCAL_PASS) {
      sessionStorage.setItem(LOCAL_KEY, "1");
      onSuccess?.();
      return;
    }

    setLoading(true); setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onSuccess?.();
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true); setError("");
    try {
      await signInWithPopup(auth, googleProvider);
      onSuccess?.();
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Brand */}
        <div className="auth-brand">
          <div className="auth-brand__icon">🍽️</div>
          <h1 className="auth-brand__name">QR Menu</h1>
        </div>

        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-sub">Sign in to manage your restaurant</p>

        {/* Google */}
        <button className="auth-google-btn" onClick={handleGoogle} disabled={loading}>
          <IcoGoogle />
          Continue with Google
        </button>

        <div className="auth-divider"><span>or</span></div>

        {/* Form */}
        <form className="auth-form" onSubmit={handleLogin} noValidate>
          <div className="auth-field">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@restaurant.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearError(); }}
              autoComplete="email"
            />
          </div>

          <div className="auth-field">
            <label>
              Password
              <button type="button" className="auth-field__toggle" onClick={() => setShowPwd((v) => !v)}>
                {showPwd ? "Hide" : "Show"}
              </button>
            </label>
            <input
              type={showPwd ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearError(); }}
              autoComplete="current-password"
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button className="auth-submit-btn" type="submit" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : null}
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        {/* Default credentials hint */}
        <div className="auth-hint-wrap">
          <button className="auth-hint-toggle" onClick={() => setShowHint((v) => !v)}>
            {showHint ? "Hide" : "Show"} default credentials
          </button>
          {showHint && (
            <div className="auth-hint-box">
              <p>
                <span>Email</span>
                <code>{LOCAL_EMAIL}</code>
              </p>
              <p>
                <span>Password</span>
                <code>{LOCAL_PASS}</code>
              </p>
            </div>
          )}
        </div>

        <p className="auth-switch">
          Don't have an account?{" "}
          <button onClick={onSwitch}>Create one</button>
        </p>
      </div>

      <div className="auth-bg" />
    </div>
  );
}

// also export so AuthPage / app can check session
export { LOCAL_KEY };

function friendlyError(code) {
  switch (code) {
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":    return "Incorrect email or password.";
    case "auth/invalid-email":         return "Please enter a valid email.";
    case "auth/too-many-requests":     return "Too many attempts. Try again later.";
    case "auth/operation-not-allowed": return "Email sign-in not enabled yet. Use the default credentials below.";
    default:                           return "Something went wrong. Please try again.";
  }
}
