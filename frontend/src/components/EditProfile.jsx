import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, X, MessageCircle, Phone, Send } from "lucide-react";
import { BigFace, PRESET_AVATARS } from "./PresetAvatars";
import { API_BASE, authFetch, isLoggedIn } from "../utils/auth";

const COLORS = {
  forest: "#2F6B4F",
  ink: "#1F2A1E",
  inkSoft: "#5B6459",
  line: "#E1DACB",
  chipBg: "#F1F1F1",
};

const PREVIEW_SIZE = 140;
const PREVIEW_FACE_SIZE = 92;
const ROW_SIZE = 72;
const ROW_FACE_SIZE = 48;

export default function EditProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0].id);
  const [customPhoto, setCustomPhoto] = useState(null);
  const [customPhotoFile, setCustomPhotoFile] = useState(null);

  const [callEnabled, setCallEnabled] = useState(false);
  const [telegramEnabled, setTelegramEnabled] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/kirish", { state: { from: "/profil/tahrirlash" } });
      return;
    }
    authFetch(`${API_BASE}/api/users/profile/`)
      .then((res) => {
        if (res.status === 401) {
          navigate("/kirish", { state: { from: "/profil/tahrirlash" } });
          return null;
        }
        if (!res.ok) throw new Error("Profilni yuklab bo'lmadi");
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        setName(data.username || "");
        setPhoneNumber(data.phone_number || "");
        if (data.avatar) {
          // Haqiqiy yuklangan foto bor — uni ko'rsatamiz
          setCustomPhoto(data.avatar);
        } else if (data.avatar_preset) {
          // Ilgari tanlangan tayyor avatar bor — uni tanlangan holatga o'tkazamiz
          setSelectedAvatar(data.avatar_preset);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomPhoto(URL.createObjectURL(file));
      setCustomPhotoFile(file);
      setSelectedAvatar(null);
    }
    e.target.value = "";
  };

  const handleSelectPreset = (id) => {
    setSelectedAvatar(id);
    setCustomPhoto(null);
    setCustomPhotoFile(null);
  };

  const handleDone = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setSaveError("Ism bo'sh bo'lishi mumkin emas");
      return;
    }

    if (!isLoggedIn()) {
      navigate("/kirish", { state: { from: "/profil/tahrirlash" } });
      return;
    }

    setSaving(true);
    setSaveError(null);
    try {
      let res;

      if (customPhotoFile) {
        // Yangi rasm fayli tanlangan bo'lsa, multipart/form-data orqali yuboramiz
        const formData = new FormData();
        formData.append("username", trimmed);
        formData.append("avatar", customPhotoFile);
        formData.append("avatar_preset", "");
        res = await authFetch(`${API_BASE}/api/users/profile/`, {
          method: "PATCH",
          body: formData,
        });
      } else {
        // Tayyor avatarlardan biri tanlangan bo'lsa, oddiy JSON orqali yuboramiz
        res = await authFetch(`${API_BASE}/api/users/profile/`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: trimmed,
            avatar_preset: selectedAvatar || "",
          }),
        });
      }

      if (res.status === 401) {
        navigate("/kirish", { state: { from: "/profil/tahrirlash" } });
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const firstKey = data ? Object.keys(data)[0] : null;
        const msg = firstKey
          ? Array.isArray(data[firstKey])
            ? data[firstKey][0]
            : data[firstKey]
          : null;
        throw new Error(msg || "Saqlashda xatolik yuz berdi");
      }

      navigate(-1);
    } catch (err) {
      console.error("Profilni saqlashda xatolik:", err);
      setSaveError(err.message || "Saqlashda xatolik yuz berdi. Server bilan aloqa yo'q bo'lishi mumkin.");
    } finally {
      setSaving(false);
    }
  };

  const selectedPreset = PRESET_AVATARS.find((a) => a.id === selectedAvatar);
  const previewBg = customPhoto ? "transparent" : selectedPreset?.bg || COLORS.chipBg;
  const PreviewFace = selectedPreset?.Face || PRESET_AVATARS[0].Face;

  return (
    <div style={{ minHeight: "100vh", background: "white" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 16px",
          borderBottom: `1px solid ${COLORS.line}`,
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 15,
            color: COLORS.inkSoft,
            fontWeight: 600,
          }}
        >
          Bekor qilish
        </button>
        <span style={{ fontSize: 16, fontWeight: 800, color: COLORS.ink }}>Tahrirlash</span>
        <button
          onClick={handleDone}
          disabled={saving || loading}
          style={{
            background: "none",
            border: "none",
            cursor: saving || loading ? "not-allowed" : "pointer",
            fontSize: 15,
            color: COLORS.forest,
            fontWeight: 700,
            opacity: saving || loading ? 0.6 : 1,
          }}
        >
          {saving ? "Saqlanmoqda..." : "Tayyor"}
        </button>
      </div>

      <div style={{ padding: "24px 20px 0" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <div
            style={{
              width: PREVIEW_SIZE,
              height: PREVIEW_SIZE,
              borderRadius: "50%",
              background: previewBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {customPhoto ? (
              <img
                src={customPhoto}
                alt="Profil rasmi"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <BigFace Face={PreviewFace} size={PREVIEW_FACE_SIZE} />
            )}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 14,
            overflowX: "auto",
            paddingBottom: 6,
            marginBottom: 28,
          }}
        >
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: ROW_SIZE,
              height: ROW_SIZE,
              borderRadius: "50%",
              background: COLORS.chipBg,
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Camera size={28} color={COLORS.ink} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            style={{ display: "none" }}
          />

          {PRESET_AVATARS.map(({ id, bg, Face }) => (
            <button
              key={id}
              onClick={() => handleSelectPreset(id)}
              style={{
                width: ROW_SIZE,
                height: ROW_SIZE,
                borderRadius: "50%",
                background: bg,
                border:
                  selectedAvatar === id && !customPhoto
                    ? `3px solid ${COLORS.forest}`
                    : "3px solid transparent",
                cursor: "pointer",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <Face size={ROW_FACE_SIZE} />
            </button>
          ))}
        </div>

        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, color: COLORS.ink }}>
          Sizning ismingiz
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: COLORS.chipBg,
            borderRadius: 14,
            padding: "14px 16px",
            marginBottom: saveError ? 8 : 28,
          }}
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Sizning ismingiz"
            style={{
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: 15,
              width: "100%",
              color: COLORS.ink,
            }}
          />
          {name && (
            <button
              onClick={() => setName("")}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
            >
              <X size={18} color={COLORS.inkSoft} />
            </button>
          )}
        </div>
        {saveError && (
          <div style={{ color: "#C0392B", fontSize: 13, marginBottom: 20 }}>{saveError}</div>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 700, color: COLORS.ink }}>
            Siz bilan bog'lanish usullari
          </span>
          <span
            style={{
              background: "#E6F4EA",
              color: COLORS.forest,
              fontSize: 12,
              fontWeight: 700,
              padding: "4px 10px",
              borderRadius: 999,
            }}
          >
            Xavfsiz
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 10 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: COLORS.chipBg,
              borderRadius: 14,
              padding: "14px 16px",
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: COLORS.forest,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <MessageCircle size={19} color="white" />
            </div>
            <div>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: COLORS.ink }}>Chat QaytaUz</div>
              <div style={{ fontSize: 12.5, color: COLORS.inkSoft }}>
                Sukut bo'yicha yoqilgan
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: COLORS.chipBg,
              borderRadius: 14,
              padding: "14px 16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: "#C1276B",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Phone size={18} color="white" />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: COLORS.ink }}>
                Telefon orqali qo'ng'iroq qilish
              </div>
            </div>
            <button
              onClick={() => setCallEnabled((v) => !v)}
              style={{
                width: 40,
                height: 22,
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
                background: callEnabled ? COLORS.forest : "#CFCFCF",
                position: "relative",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "white",
                  position: "absolute",
                  top: 2,
                  left: callEnabled ? 20 : 2,
                  transition: "left 0.15s",
                }}
              />
            </button>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: COLORS.chipBg,
              borderRadius: 14,
              padding: "14px 16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: "#2AA9E0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Send size={17} color="white" />
              </div>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: COLORS.ink }}>
                  Telegramda suhbat
                </div>
                <div style={{ fontSize: 12.5, color: COLORS.inkSoft }}>
                  raqam bo'yicha {phoneNumber}
                </div>
              </div>
            </div>
            <button
              onClick={() => setTelegramEnabled((v) => !v)}
              style={{
                width: 40,
                height: 22,
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
                background: telegramEnabled ? COLORS.forest : "#CFCFCF",
                position: "relative",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "white",
                  position: "absolute",
                  top: 2,
                  left: telegramEnabled ? 20 : 2,
                  transition: "left 0.15s",
                }}
              />
            </button>
          </div>
        </div>

        <div style={{ fontSize: 12.5, color: COLORS.inkSoft, lineHeight: 1.5, paddingBottom: 30 }}>
          Tanlangan aloqa usullari barcha e'lonlaringizda ko'rsatiladi
        </div>
      </div>
    </div>
  );
}
