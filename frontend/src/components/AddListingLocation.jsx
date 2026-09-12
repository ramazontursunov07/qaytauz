import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Search, MapPin, Truck } from "lucide-react";

const COLORS = {
  forest: "#2F6B4F",
  forestBg: "#E6F0EA",
  inkSoft: "#5B6459",
  chipBg: "#F1F1F1",
};

function getDefaultSearch() {
  const saved = localStorage.getItem("qaytauz_location");
  if (!saved) return "";
  try {
    const parsed = JSON.parse(saved);
    return parsed.label ? `O'zbekiston, ${parsed.label}` : "";
  } catch {
    return "";
  }
}

export default function AddListingLocation() {
  const navigate = useNavigate();
  const location = useLocation();
  const prevState = location.state || {};

  const [search, setSearch] = useState(prevState.searchLocation || getDefaultSearch());
  const [landmark, setLandmark] = useState(prevState.landmark || "");
  const [courierReady, setCourierReady] = useState(prevState.courierReady || false);

  const canContinue = search.trim().length > 0;

  const handleShowOnMap = () => {
    // TODO: bu yerga haqiqiy xarita (Yandex/Google Maps) ulanadi.
    // Hozircha placeholder — keyingi bosqichda API kalit bilan ulaymiz.
    alert("Xarita hali ulanmagan. Hozircha manzilni qo'lda kiriting.");
  };

  const handleContinue = () => {
    if (!canContinue) return;
    navigate("/sotish/kontakt", {
    state: { ...prevState, searchLocation: search, landmark, courierReady },
    });
  };

  return (
    <div style={{ minHeight: "100vh", background: "white", paddingBottom: 100 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 16px 8px",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
        >
          <ArrowLeft size={22} color="#1A1A1A" />
        </button>
        <button
          onClick={() => navigate("/sotish")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: COLORS.inkSoft,
            fontSize: 15,
          }}
        >
          Saqlash va chiqish
        </button>
      </div>

      <div style={{ padding: "12px 20px 0" }}>
        <h1 style={{ fontSize: 21, fontWeight: 800, margin: "0 0 20px", color: "#1A1A1A", lineHeight: 1.3 }}>
          Xaridor bilan uchrashuv joyini belgilang
        </h1>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: COLORS.chipBg,
            borderRadius: 14,
            padding: "14px 16px",
            marginBottom: 12,
          }}
        >
          <Search size={18} color={COLORS.inkSoft} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="O'zbekiston, shahar nomi"
            style={{
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: 15,
              width: "100%",
              color: "#1A1A1A",
            }}
          />
        </div>

        <button
          onClick={handleShowOnMap}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            background: COLORS.forestBg,
            color: COLORS.forest,
            border: "none",
            borderRadius: 14,
            padding: "14px 0",
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
            marginBottom: 28,
          }}
        >
          <MapPin size={18} />
          Xaritada ko'rsatish
        </button>

        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, color: "#1A1A1A" }}>
          Belgilangan joyni ko'rsating
        </div>
        <input
          value={landmark}
          onChange={(e) => setLandmark(e.target.value)}
          placeholder="Masalan, Chorsu bozori"
          style={{
            width: "100%",
            boxSizing: "border-box",
            background: COLORS.chipBg,
            border: "none",
            borderRadius: 14,
            padding: "16px 16px",
            fontSize: 15,
            outline: "none",
            marginBottom: 28,
          }}
        />

        <div style={{ fontSize: 13.5, color: COLORS.inkSoft, marginBottom: 10 }}>
          Yetkazib berishni o'zingiz tashkil qilasiz
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
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Truck size={22} color={COLORS.forest} />
            <span style={{ fontSize: 14.5, color: "#1A1A1A" }}>
              Kuryer orqali yuborishga tayyor
            </span>
          </div>
          <button
            onClick={() => setCourierReady((v) => !v)}
            style={{
              width: 40,
              height: 22,
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              background: courierReady ? COLORS.forest : "#CFCFCF",
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
                left: courierReady ? 20 : 2,
                transition: "left 0.15s",
              }}
            />
          </button>
        </div>
      </div>

      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 480,
          padding: 16,
          background: "white",
          boxSizing: "border-box",
        }}
      >
        <button
          onClick={handleContinue}
          disabled={!canContinue}
          style={{
            width: "100%",
            background: !canContinue ? "#B7CFC0" : COLORS.forest,
            color: "white",
            border: "none",
            borderRadius: 28,
            padding: "16px 0",
            fontSize: 16,
            fontWeight: 700,
            cursor: !canContinue ? "not-allowed" : "pointer",
          }}
        >
          Davom ettirish
        </button>
      </div>
    </div>
  );
}
