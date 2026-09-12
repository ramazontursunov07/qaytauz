import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const COLORS = {
  forest: "#2F6B4F",
  inkSoft: "#5B6459",
  chipBg: "#F1F1F1",
  chipActive: "#1A1A1A",
};

const CONDITIONS = [
  { value: "yangidek", label: "B/y (yangidek)" },
  { value: "izlari_bor", label: "B/y (ishlatilganlik izlari bor)" },
  { value: "kamchiliklari_bor", label: "B/y (ko'rinarli kamchiliklari bor)" },
  { value: "yangi", label: "Yangi" },
];

const AUDIENCES = [
  { value: "ayollar", label: "Ayollar uchun" },
  { value: "erkaklar", label: "Erkaklar uchun" },
  { value: "uniseks", label: "Uniseks" },
];

function Pill({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "12px 18px",
        borderRadius: 999,
        border: "none",
        cursor: "pointer",
        fontSize: 14.5,
        fontWeight: 600,
        background: active ? COLORS.chipActive : COLORS.chipBg,
        color: active ? "white" : "#1A1A1A",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

export default function AddListingAttributes() {
  const navigate = useNavigate();
  const location = useLocation();
  const prevState = location.state || {};

  const [condition, setCondition] = useState("yangidek");
  const [audience, setAudience] = useState("erkaklar");

  const handleContinue = () => {
    navigate("/sotish/tavsif", {
      state: { ...prevState, condition, audience },
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
        <h1 style={{ fontSize: 21, fontWeight: 800, margin: "0 0 20px", color: "#1A1A1A" }}>
          Xususiyatlarni belgilang
        </h1>

        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, color: "#1A1A1A" }}>
          Holat
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
          {CONDITIONS.map((c) => (
            <Pill key={c.value} active={condition === c.value} onClick={() => setCondition(c.value)}>
              {c.label}
            </Pill>
          ))}
        </div>

        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, color: "#1A1A1A" }}>
          Kim uchun
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {AUDIENCES.map((a) => (
            <Pill key={a.value} active={audience === a.value} onClick={() => setAudience(a.value)}>
              {a.label}
            </Pill>
          ))}
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
          style={{
            width: "100%",
            background: COLORS.forest,
            color: "white",
            border: "none",
            borderRadius: 28,
            padding: "16px 0",
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Davom ettirish
        </button>
      </div>
    </div>
  );
}
