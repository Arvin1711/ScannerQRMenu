import { useState } from "react";
import Login from "./Login.jsx";
import Signup from "./Signup.jsx";

export default function AuthPage({ onSuccess }) {
  const [mode, setMode] = useState("login");

  return mode === "login"
    ? <Login  onSwitch={() => setMode("signup")} onSuccess={onSuccess} />
    : <Signup onSwitch={() => setMode("login")}  onSuccess={onSuccess} />;
}
