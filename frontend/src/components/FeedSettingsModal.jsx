import { useState } from "react";
import { X, ChevronRight } from "lucide-react";
import LocationPicker from "./LocationPicker";

const COLORS = {
  forest: "#2F6B4F",
  inkSoft: "#5B6459",
  line: "#E1DACB",
  pink: "#B4126E",
};

const INTERESTS = [
  { key: "electronics", label: "Elektronika", icon: "📱" },
  { key: "appliances", label: "Maishiy texnika", icon: "🧺" },
  { key: "furniture", label: "Mebel va interyer", icon: "🛋️" },
  { key: "beauty", label: "Go'zallik va salomatlik", icon: "💄" },
  { key: "women_clothing", label: "Ayollar kiyimi", icon: "👗" },
  { key: "men_clothing", label: "Erkaklar kiyimi", icon: "👕" },
  { key: "jewelry", label: "Zargarlik buyumlari / Aksessuarlar", icon: "⌚" },
  { key: "kids", label: "Bolalar uchun", icon: "🧸" },
  { key: "construction", label: "Qurilish va ta'mirlash", icon: "🧰" },
  { key: "plants", label: "O'simliklar", icon: "🌵" },
  { key: "transport", label: "Transport", icon: "🚗" },
  { key: "services", label: "Xizmatlar", icon: "🗓️" },
  { key: "real_estate", label: "Ko'chmas mulk", icon: "🏠" },
  { key: "business", label: "Biznes", icon: "💳" },
  { key: "jobs", label: "Ish", icon: "💼" },
  { key: "animals", label: "Hayvonlar", icon: "🐱" },
  { key: "products", label: "Mahsulotlar", icon: "🌸" },
  { key: "hobby_sport", label: "Xobbi va sport", icon: "⚽" },
  { key: "stationery", label: "Kanselyariya tovarlari", icon: "✂️" },
];

const CONDITIONS = [
  { key: "any", label: "Har qanday tovarlar" },
  { key: "new", label: "Faqat yangi" },
];

const PRICE_SEGMENTS = [
  { key: "any", label: "Har qanday narx" },
  { key: "premium", label: "Premium" },
  { key: "cheap", label: "Arzonroq" },
];

export default function FeedSettingsModal({ onClose, onSave }) {
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [condition, setCondition] = useState("any");
  const [priceSegment, setPriceSegment] = useState("any");
  const [location, setLocation] = useState(() => {
    const saved = localStorage.getItem("qaytauz_location");
    if (!saved) return { label: "Toshkent", region: "Toshkent shahri", district: null };
    try {
      const parsed = JSON.parse(saved);
      return parsed?.label ? parsed : { label: "Toshkent", region: "Toshkent shahri", district: null };
    } catch {
      return { label: "Toshkent", region: "Toshkent shahri", district: null };
    }
  });

  const handleLocationSelect = (loc) => {
    setLocation(loc);
    localStorage.setItem("qaytauz_location", JSON.stringify(loc));
  };

  const toggleInterest = (key) => {
    setSelectedInterests((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleReset = () => {
    setSelectedInterests([]);
    setCondition("any");
    setPriceSegment("any");
  };

  const handleSave = () => {
    onSave?.({ interests: selectedInterests, condition, priceSegment, location: location.label });
    onClose?.();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        zIndex: 200,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "white",
          width: "100%",
          maxWidth: 480,
          maxHeight: "90vh",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 16px",
            borderBottom: `1px solid ${COLORS.line}`,
          }}
        >
          <div style={{ width: 22 }} />
          <div style={{ fontWeight: 700, fontSize: 17 }}>Lenta sozlamalari</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X size={22} />
          </button>
        </div>

        <div style={{ overflowY: "auto", padding: "20px 16px" }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>Qayerdan qidirish?</div>
          <LocationPicker
            selectedLabel={location.label}
            onSelect={handleLocationSelect}
            trigger={({ selectedLabel, onClick }) => (
              <button
                onClick={onClick}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "#F1F1F1",
                  border: "none",
                  borderRadius: 14,
                  padding: "14px 16px",
                  marginBottom: 24,
                  cursor: "pointer",
                }}
              >
                <span style={{ fontSize: 15, color: "#1A1A1A" }}>{selectedLabel}</span>
                <ChevronRight size={18} color={COLORS.inkSoft} />
              </button>
            )}
          />

          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
            Sizning qiziqishlaringiz
          </div>
          <div style={{ fontSize: 12.5, color: COLORS.inkSoft, marginBottom: 14 }}>
            Kamida 1 ta qiziqish
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
            {INTERESTS.map((item) => {
              const active = selectedInterests.includes(item.key);
              return (
                <button
                  key={item.key}
                  onClick={() => toggleInterest(item.key)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: active ? "#1A1A1A" : "#F1F1F1",
                    color: active ? "white" : "#1A1A1A",
                    border: "none",
                    borderRadius: 24,
                    padding: "10px 14px",
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </div>

          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Tovar holati</div>
          <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
            {CONDITIONS.map((c) => {
              const active = condition === c.key;
              return (
                <button
                  key={c.key}
                  onClick={() => setCondition(c.key)}
                  style={{
                    background: active ? "#1A1A1A" : "#F1F1F1",
                    color: active ? "white" : "#1A1A1A",
                    border: "none",
                    borderRadius: 24,
                    padding: "10px 16px",
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  {c.label}
                </button>
              );
            })}
          </div>

          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Narx segmenti</div>
          <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
            {PRICE_SEGMENTS.map((p) => {
              const active = priceSegment === p.key;
              return (
                <button
                  key={p.key}
                  onClick={() => setPriceSegment(p.key)}
                  style={{
                    background: active ? "#1A1A1A" : "#F1F1F1",
                    color: active ? "white" : "#1A1A1A",
                    border: "none",
                    borderRadius: 24,
                    padding: "10px 16px",
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ padding: 16, borderTop: `1px solid ${COLORS.line}` }}>
          <button
            onClick={handleSave}
            disabled={selectedInterests.length === 0}
            style={{
              width: "100%",
              background: selectedInterests.length === 0 ? "#E3A9C6" : COLORS.pink,
              color: "white",
              border: "none",
              borderRadius: 28,
              padding: "16px 0",
              fontSize: 16,
              fontWeight: 700,
              cursor: selectedInterests.length === 0 ? "not-allowed" : "pointer",
              marginBottom: 10,
            }}
          >
            Saqlash
          </button>
          <button
            onClick={handleReset}
            style={{
              width: "100%",
              background: "#F1F1F1",
              color: "#1A1A1A",
              border: "none",
              borderRadius: 28,
              padding: "16px 0",
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Sozlamalarni tiklash
          </button>
        </div>
      </div>
    </div>
  );
}
