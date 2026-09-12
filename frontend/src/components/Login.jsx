import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { User, Lock, Mail, Phone, Eye, EyeOff } from "lucide-react";
import { setTokens } from "../utils/auth";

const COLORS = {
  forest: "#2F6B4F",
  inkSoft: "#5B6459",
  line: "#E1DACB",
  cream: "#FAF6EE",
  pink: "#B4126E",
};

const API_BASE = "http://localhost:8000";
const PHONE_REGEX = /^\+998\d{9}$/;

async function parseErrorMessage(res) {
  try {
    const data = await res.json();
    if (typeof data === "string") return data;
    if (data.detail) return data.detail;
    // DRF validation errors: { field: ["msg", ...], ... }
    const firstKey = Object.keys(data)[0];
    if (firstKey) {
      const val = data[firstKey];
      const msg = Array.isArray(val) ? val[0] : val;
      return `${firstKey}: ${msg}`;
    }
    return "Noma'lum xatolik yuz berdi";
  } catch {
    return "Noma'lum xatolik yuz berdi";
  }
}

async function loginWithCredentials(username, password) {
  const res = await fetch(`${API_BASE}/api/v1/auth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  const data = await res.json();
  setTokens({ access: data.access, refresh: data.refresh });
}

const inputWrapStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  background: "#F1F1F1",
  borderRadius: 14,
  padding: "12px 14px",
  marginBottom: 12,
};

const inputStyle = {
  border: "none",
  background: "none",
  outline: "none",
  fontSize: 15,
  flex: 1,
  color: "#1A1A1A",
  fontFamily: "inherit",
};

const eyeButtonStyle = {
  border: "none",
  background: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  padding: 0,
  color: COLORS.inkSoft,
};

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  // Foydalanuvchi biror himoyalangan amal (masalan "Sevimlilarga qo'shish" yoki
  // "E'lon berish") ustida login sahifasiga yo'naltirilgan bo'lsa, muvaffaqiyatli
  // kirgandan so'ng aynan o'sha joyga qaytaramiz.
  const redirectTo = location.state?.from || "/profil";

  const [mode, setMode] = useState("login"); // "login" | "register"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError(null);
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await loginWithCredentials(username, password);
      navigate(redirectTo);
    } catch (err) {
      setError(err.message || "Login yoki parol noto'g'ri");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    if (!PHONE_REGEX.test(phoneNumber)) {
      setError("Telefon raqamni to'g'ri formatda kiriting: +998xxxxxxxxx");
      return;
    }
    if (password !== confirmPassword) {
      setError("Parollar bir-biriga mos kelmadi");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/users/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
          phone_number: phoneNumber,
        }),
      });
      if (!res.ok) throw new Error(await parseErrorMessage(res));
      // Ro'yxatdan o'tgandan so'ng avtomatik login qilamiz
      await loginWithCredentials(username, password);
      navigate(redirectTo);
    } catch (err) {
      setError(err.message || "Ro'yxatdan o'tishda xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        background: COLORS.cream,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "white",
          borderRadius: 20,
          padding: "28px 22px",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 4,
            color: "#1A1A1A",
          }}
        >
          {mode === "login" ? "Xush kelibsiz" : "Ro'yxatdan o'tish"}
        </h1>
        <p style={{ textAlign: "center", color: COLORS.inkSoft, fontSize: 14, marginBottom: 24 }}>
          {mode === "login"
            ? "Profilingizga kirish uchun ma'lumotlaringizni kiriting"
            : "QaytaUz'da yangi hisob yarating"}
        </p>

        <form onSubmit={mode === "login" ? handleLogin : handleRegister}>
          <div style={inputWrapStyle}>
            <User size={18} color={COLORS.inkSoft} />
            <input
              style={inputStyle}
              placeholder="Foydalanuvchi nomi"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {mode === "register" && (
            <>
              <div style={inputWrapStyle}>
                <Mail size={18} color={COLORS.inkSoft} />
                <input
                  style={inputStyle}
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div style={inputWrapStyle}>
                <Phone size={18} color={COLORS.inkSoft} />
                <input
                  style={inputStyle}
                  placeholder="+998901234567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  pattern="^\+998\d{9}$"
                  title="Telefon raqamni to'g'ri formatda kiriting: +998xxxxxxxxx"
                  required
                />
              </div>
            </>
          )}

          <div style={inputWrapStyle}>
            <Lock size={18} color={COLORS.inkSoft} />
            <input
              style={inputStyle}
              type={showPassword ? "text" : "password"}
              placeholder="Parol"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              style={eyeButtonStyle}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {mode === "register" && (
            <div style={inputWrapStyle}>
              <Lock size={18} color={COLORS.inkSoft} />
              <input
                style={inputStyle}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Parolni takrorlang"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                style={eyeButtonStyle}
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          )}

          {error && (
            <div style={{ color: "#C0392B", fontSize: 13.5, marginBottom: 12, textAlign: "center" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: "100%",
              background: COLORS.pink,
              color: "white",
              border: "none",
              borderRadius: 28,
              padding: "14px 0",
              fontSize: 15,
              fontWeight: 700,
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.7 : 1,
              marginTop: 4,
            }}
          >
            {submitting ? "Yuklanmoqda..." : mode === "login" ? "Kirish" : "Ro'yxatdan o'tish"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 18, fontSize: 14, color: COLORS.inkSoft }}>
          {mode === "login" ? (
            <>
              Hisobingiz yo'qmi?{" "}
              <span
                onClick={() => switchMode("register")}
                style={{ color: COLORS.forest, fontWeight: 700, cursor: "pointer" }}
              >
                Ro'yxatdan o'ting
              </span>
            </>
          ) : (
            <>
              Hisobingiz bormi?{" "}
              <span
                onClick={() => switchMode("login")}
                style={{ color: COLORS.forest, fontWeight: 700, cursor: "pointer" }}
              >
                Kiring
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
