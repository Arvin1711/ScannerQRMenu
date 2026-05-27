import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase.js";
import { IcoGoogle } from "../icons.jsx";
import "../scss/auth.scss";

export default function Signup({ onSwitch, onSuccess }) {
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPwd, setShowPwd]   = useState(false);

  const clearError = () => setError("");

  const strength = passwordStrength(password);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!name.trim())         { setError("Please enter your name."); return; }
    if (!email)               { setError("Please enter your email."); return; }
    if (password.length < 6)  { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm)  { setError("Passwords do not match."); return; }

    setLoading(true); setError("");
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name.trim() });
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

        <h2 className="auth-title">Create account</h2>
        <p className="auth-sub">Set up your restaurant dashboard</p>

        {/* Google */}
        <button className="auth-google-btn" onClick={handleGoogle} disabled={loading}>
          <IcoGoogle />
          Sign up with Google
        </button>

        <div className="auth-divider"><span>or</span></div>

        {/* Form */}
        <form className="auth-form" onSubmit={handleSignup} noValidate>
          <div className="auth-field">
            <label>Full name</label>
            <input
              type="text"
              placeholder="John Smith"
              value={name}
              onChange={(e) => { setName(e.target.value); clearError(); }}
              autoComplete="name"
            />
          </div>

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
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearError(); }}
              autoComplete="new-password"
            />
            {password.length > 0 && (
              <div className="auth-strength">
                <div className={`auth-strength__bar auth-strength__bar--${strength.level}`} />
                <span className={`auth-strength__label auth-strength__label--${strength.level}`}>
                  {strength.label}
                </span>
              </div>
            )}
          </div>

          <div className="auth-field">
            <label>Confirm password</label>
            <input
              type={showPwd ? "text" : "password"}
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => { setConfirm(e.target.value); clearError(); }}
              autoComplete="new-password"
              className={confirm.length > 0 && confirm !== password ? "auth-input--mismatch" : ""}
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button className="auth-submit-btn" type="submit" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : null}
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <button onClick={onSwitch}>Sign in</button>
        </p>
      </div>

      <div className="auth-bg" />
    </div>
  );
}

function passwordStrength(pwd) {
  if (pwd.length === 0)  return { level: "", label: "" };
  if (pwd.length < 6)    return { level: "weak",   label: "Weak" };
  const hasUpper  = /[A-Z]/.test(pwd);
  const hasNum    = /[0-9]/.test(pwd);
  const hasSymbol = /[^A-Za-z0-9]/.test(pwd);
  const score = [hasUpper, hasNum, hasSymbol].filter(Boolean).length;
  if (score === 0) return { level: "fair",   label: "Fair" };
  if (score === 1) return { level: "good",   label: "Good" };
  return              { level: "strong", label: "Strong" };
}

function friendlyError(code) {
  switch (code) {
    case "auth/email-already-in-use": return "An account with this email already exists.";
    case "auth/invalid-email":        return "Please enter a valid email.";
    case "auth/weak-password":        return "Password must be at least 6 characters.";
    default:                          return "Something went wrong. Please try again.";
  }
}
