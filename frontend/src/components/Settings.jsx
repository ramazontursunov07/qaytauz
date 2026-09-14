import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, SlidersHorizontal, ChevronRight } from "lucide-react";
import FeedSettingsModal from "./FeedSettingsModal";
import { API_URL } from "../config";

const COLORS = {
  ink: "#1A1A1A",
  inkSoft: "#5B6459",
  line: "#E1DACB",
  cream: "#FAF6EE",
  pink: "#B4126E",
};

const APP_VERSION = "1.0.0";
const API_BASE = API_URL;

function authHeaders() {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function Settings() {
  const navigate = useNavigate();
  const [showFeedSettings, setShowFeedSettings] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // "Lenta sozlamalari" alohida sahifa emas, balki modal bo'lgani uchun
  // uni navigate() bilan emas, shu holat orqali ochamiz.
  const SETTINGS_ITEMS = [
    { icon: Bell, label: "Bildirishnomalar", action: () => navigate("/sozlamalari/bildirishnomalar") },
    { icon: SlidersHorizontal, label: "Lenta sozlamalari", action: () => setShowFeedSettings(true) },
  ];

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/kirish");
  };

  const handleDeleteAccount = () => {
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteAccount = () => {
    setDeleting(true);
    fetch(`${API_BASE}/api/users/profile/`, {
      method: "DELETE",
      headers: authHeaders(),
    })
      .then((res) => {
        if (!res.ok && res.status !== 204) throw new Error();
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        navigate("/kirish");
      })
      .catch(() => {
        alert("Akkauntni o'chirib bo'lmadi, qaytadan urinib ko'ring.");
      })
      .finally(() => {
        setDeleting(false);
        setDeleteConfirmOpen(false);
      });
  };

  return (
    <div style={{ background: "#F2F2F2", height: "100vh", overflow: "hidden", position: "relative" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          padding: "16px 20px",
          background: COLORS.cream,
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            position: "absolute",
            left: 16,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 4,
          }}
        >
          <ArrowLeft size={22} color={COLORS.ink} />
        </button>
        <h1
          style={{
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: "0.3px",
            margin: 0,
            color: COLORS.ink,
          }}
        >
          Sozlamalar
        </h1>
      </div>

      <div style={{ background: "white", marginTop: 70 }}>
        {SETTINGS_ITEMS.map(({ icon: Icon, label, action }, i) => (
          <div
            key={label}
            onClick={action}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "16px 20px",
              cursor: "pointer",
              borderBottom: i < SETTINGS_ITEMS.length - 1 ? `1px solid ${COLORS.line}` : "none",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "#F2F2F2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon size={18} color={COLORS.ink} />
            </div>
            <span style={{ flex: 1, fontSize: 15.5, color: COLORS.ink }}>{label}</span>
            <ChevronRight size={18} color={COLORS.inkSoft} />
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", color: COLORS.inkSoft, fontSize: 13, margin: "16px 0" }}>
        Versiya {APP_VERSION}
      </div>

      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 480,
          padding: "16px",
          boxSizing: "border-box",
          background: "#F2F2F2",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <button
          onClick={handleLogout}
          style={{
            background: "white",
            border: "1px solid #E05353",
            borderRadius: 14,
            padding: "14px 0",
            fontSize: 15,
            fontWeight: 700,
            color: "#E05353",
            cursor: "pointer",
          }}
        >
          Ilovadan chiqish
        </button>
        <button
          onClick={handleDeleteAccount}
          style={{
            background: "#F2F2F2",
            border: "none",
            borderRadius: 14,
            padding: "14px 0",
            fontSize: 15,
            fontWeight: 600,
            color: COLORS.ink,
            cursor: "pointer",
          }}
        >
          Akkauntni o'chirish
        </button>
      </div>

      {showFeedSettings && (
        <FeedSettingsModal
          onClose={() => setShowFeedSettings(false)}
          onSave={(settings) => console.log("Lenta sozlamalari saqlandi:", settings)}
        />
      )}

      {/* "Akkauntni o'chirish" bosilganda chiqadigan tasdiqlash oynasi */}
      {deleteConfirmOpen && (
        <div
          onClick={() => !deleting && setDeleteConfirmOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 250,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            boxSizing: "border-box",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 400,
              background: "white",
              borderRadius: 20,
              padding: "28px 22px 22px",
              boxSizing: "border-box",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "#F2F2F2",
                margin: "0 auto 18px",
              }}
            />

            <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.ink, marginBottom: 10 }}>
              Akkaunt o'chirilsinmi?
            </div>
            <div style={{ fontSize: 14, color: COLORS.inkSoft, lineHeight: 1.5, marginBottom: 22 }}>
              Sizning e'lonlaringiz, qidiruv tarixingiz va saqlab qo'ygan narsalaringiz o'chirib tashlanadi. Bu amalni qaytarib bo'lmaydi.
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                disabled={deleting}
                style={{
                  flex: 1,
                  background: "#F2F2F2",
                  color: COLORS.ink,
                  border: "none",
                  borderRadius: 14,
                  padding: "14px 0",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: deleting ? "not-allowed" : "pointer",
                }}
              >
                Bekor qilish
              </button>
              <button
                onClick={confirmDeleteAccount}
                disabled={deleting}
                style={{
                  flex: 1,
                  background: COLORS.pink,
                  color: "white",
                  border: "none",
                  borderRadius: 14,
                  padding: "14px 0",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: deleting ? "not-allowed" : "pointer",
                  opacity: deleting ? 0.7 : 1,
                }}
              >
                {deleting ? "O'chirilmoqda..." : "Ha, o'chirish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
