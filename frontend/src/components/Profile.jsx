import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, ChevronRight, Pencil, Heart, Megaphone, ShoppingBag,Settings,
  SlidersHorizontal, Check, Store, LifeBuoy, Loader2,
} from "lucide-react";
import BottomNav from "./BottomNav";
import FeedSettingsModal from "./FeedSettingsModal";
import { BigFace, getPresetAvatar } from "./PresetAvatars";
import { API_BASE, authFetch, isLoggedIn, requireLogin } from "../utils/auth";

const COLORS = {
  forest: "#2F6B4F",
  inkSoft: "#5B6459",
  line: "#E1DACB",
  cream: "#FAF6EE",
  pink: "#B4126E",
};

const MENU_ITEMS = [
  { icon: Heart, label: "Sevimlilar", path: "/sevimlilar" },
  { icon: Megaphone, label: "Mening e'lonlarim", path: "/sotish" },
  { icon: ShoppingBag, label: "Mening buyurtmalarim", path: "/buyurtmalar" },
  { icon: SlidersHorizontal, label: "Lenta sozlamalari", path: "/lenta-sozlamalari" },
  { icon: Settings, label: "Sozlamalar", path: "/sozlamalari" }
];

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFeedSettings, setShowFeedSettings] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [needsLogin, setNeedsLogin] = useState(false);

  const loadProfile = () => {
    setLoading(true);
    authFetch(`${API_BASE}/api/users/profile/`)
      .then((res) => {
        if (res.status === 401) {
          // Access ham, refresh ham eskirgan/mavjud emas — endi haqiqatan
          // qayta kirish kerak, shuning uchun in-page taklif ko'rsatamiz.
          setNeedsLogin(true);
          return null;
        }
        if (!res.ok) throw new Error("Profilni yuklab bo'lmadi");
        return res.json();
      })
      .then((data) => {
        if (data) {
          setProfile(data);
          setNameDraft(data.username || "");
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!isLoggedIn()) {
      setNeedsLogin(true);
      setLoading(false);
      return;
    }
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveName = () => {
    const trimmed = nameDraft.trim();
    if (!trimmed || trimmed === profile?.username) {
      setEditingName(false);
      return;
    }
    setSavingName(true);
    authFetch(`${API_BASE}/api/users/profile/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: trimmed }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Ismni saqlab bo'lmadi");
        return res.json();
      })
      .then((data) => {
        setProfile(data);
        setEditingName(false);
      })
      .catch(() => {
        // Xatolik bo'lsa eski qiymatga qaytaramiz
        setNameDraft(profile?.username || "");
        setEditingName(false);
      })
      .finally(() => setSavingName(false));
  };

  return (
    <div style={{ background: COLORS.cream, minHeight: "100vh", paddingBottom: 100 }}>
      <h1
        style={{
          textAlign: "center",
          fontSize: 20,
          fontWeight: 700,
          padding: "20px 16px 16px",
          margin: 0,
          color: "#1A1A1A",
        }}
      >
        Mening profilim
      </h1>

      {needsLogin ? (
        <div style={{ textAlign: "center", padding: "40px 24px" }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "#EDEDED",
              margin: "0 auto 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <User size={32} color="#B0B0B0" />
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, color: "#1A1A1A" }}>
            Profilni ko'rish uchun kiring
          </div>
          <div style={{ fontSize: 14, color: COLORS.inkSoft, marginBottom: 20, lineHeight: 1.5 }}>
            E'lonlaringizni, sevimlilaringizni va sozlamalarni boshqarish uchun hisobingizga kiring
          </div>
          <button
            onClick={() => navigate("/kirish", { state: { from: "/profil" } })}
            style={{
              background: COLORS.forest,
              color: "white",
              border: "none",
              borderRadius: 28,
              padding: "14px 32px",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Kirish
          </button>
        </div>
      ) : loading ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            color: COLORS.inkSoft,
            padding: 30,
          }}
        >
          <Loader2 size={18} className="qaytauz-spin" />
          Yuklanmoqda...
        </div>
      ) : error ? (
        <div style={{ textAlign: "center", color: "#C0392B", padding: "10px 20px 20px" }}>
          Xatolik: {error}
        </div>
      ) : profile ? (
        <>
          {/* Profil kartasi */}
          <div
            style={{
              margin: "0 16px 16px",
              background: "white",
              borderRadius: 20,
              padding: "24px 20px",
              textAlign: "center",
            }}
          >
            <div style={{ position: "relative", width: 96, height: 96, margin: "0 auto 16px" }}>
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: "50%",
                  background: "#EDEDED",
                  border: `3px solid ${COLORS.forest}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.username}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : profile.avatar_preset && getPresetAvatar(profile.avatar_preset) ? (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      background: getPresetAvatar(profile.avatar_preset).bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <BigFace Face={getPresetAvatar(profile.avatar_preset).Face} size={64} />
                  </div>
                ) : (
                  <User size={52} color="#B0B0B0" />
                )}
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: 2,
                  right: 2,
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: COLORS.forest,
                  border: "2px solid white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Check size={13} color="white" strokeWidth={3} />
              </div>
            </div>

            {editingName ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <input
                  autoFocus
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                  style={{
                    fontSize: 19,
                    fontWeight: 700,
                    textAlign: "center",
                    border: `1px solid ${COLORS.line}`,
                    borderRadius: 10,
                    padding: "4px 10px",
                    outline: "none",
                    maxWidth: 220,
                  }}
                />
                <button
                  onClick={handleSaveName}
                  disabled={savingName}
                  style={{
                    border: "none",
                    background: COLORS.forest,
                    color: "white",
                    borderRadius: 8,
                    padding: "6px 10px",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {savingName ? "..." : "Saqlash"}
                </button>
              </div>
            ) : (
              <div
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer" }}
                onClick={() => setEditingName(true)}
              >
                <span style={{ fontSize: 19, fontWeight: 700 }}>{profile.username}</span>
                <Pencil size={15} color={COLORS.inkSoft} />
              </div>
            )}

            <div style={{ fontSize: 15, color: COLORS.inkSoft, marginTop: 6 }}>
              {profile.phone_number || "Telefon raqam kiritilmagan"}
            </div>

            <div
              onClick={() => navigate("/profil/korinish")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                marginTop: 14,
                color: "#1A1A1A",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Profilim qanday ko'rinishda
              <ChevronRight size={16} color={COLORS.inkSoft} />
            </div>
          </div>
        </>
      ) : null}

      {!needsLogin && !loading && !error && (
        <>
          <div
            style={{
              margin: "0 16px 16px",
              background: `linear-gradient(135deg, #A8D5B5 0%, ${COLORS.forest} 100%)`,
              borderRadius: 16,
              padding: 20,
              color: "white",
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 18, lineHeight: 1.3, marginBottom: 12 }}>
              Soting
              <br />
              va pul ishlang
            </div>
            <button
              onClick={() => navigate("/sotish/yangi")}
              style={{
                background: COLORS.forest,
                color: "white",
                border: "none",
                borderRadius: 20,
                padding: "8px 16px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              E'lon joylashtirish
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "0 16px" }}>
            {MENU_ITEMS.map(({ icon: Icon, label, path }) => (
              <div
                key={label}
                onClick={() => (path === "/lenta-sozlamalari" ? setShowFeedSettings(true) : navigate(path))}
                style={{
                  background: "white",
                  borderRadius: 16,
                  padding: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: "#F2F2F2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={20} color="#1A1A1A" />
                </div>
                <span style={{ flex: 1, fontSize: 15, color: "#1A1A1A" }}>{label}</span>
                <ChevronRight size={18} color={COLORS.inkSoft} />
              </div>
            ))}
          </div>
        </>
      )}

      {showFeedSettings && (
        <FeedSettingsModal
          onClose={() => setShowFeedSettings(false)}
          onSave={(settings) => console.log("Sozlamalar saqlandi:", settings)}
        />
      )}

      <BottomNav />
    </div>
  );
}
