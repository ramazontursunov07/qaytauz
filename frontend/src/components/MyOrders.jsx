import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingBag } from "lucide-react";

const COLORS = {
  forest: "#2F6B4F",
  inkSoft: "#5B6459",
  ink: "#1A1A1A",
  line: "#E1DACB",
};

const TABS = [
  { key: "buying", label: "Sotib olaman" },
  { key: "selling", label: "Sotaman" },
];

const EMPTY_TEXT = {
  buying: "QaytaUz orqali buyurtma bering va u ushbu ro'yxatda paydo bo'ladi.",
  selling: "Buyurtmalar olishni boshlash uchun QaytaUz orqali tovarlaringizni joylashtiring.",
};

export default function MyOrders() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("buying");

  return (
    <div style={{ minHeight: "100vh", background: "white", paddingBottom: 100, fontFamily: "Manrope, sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px 8px" }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
        >
          <ArrowLeft size={22} color={COLORS.ink} />
        </button>
        <h1 style={{ fontSize: 19, fontWeight: 800, margin: 0, color: COLORS.ink }}>
          Mening buyurtmalarim
        </h1>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 150,
          borderBottom: `1px solid ${COLORS.line}`,
          padding: "0 20px",
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "14px 0",
              fontSize: 15,
              fontWeight: activeTab === tab.key ? 700 : 500,
              color: activeTab === tab.key ? COLORS.ink : COLORS.inkSoft,
              borderBottom: activeTab === tab.key ? `2px solid ${COLORS.ink}` : "2px solid transparent",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          padding: "60px 32px 0",
        }}
      >
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: "50%",
            background: "#F2F2F2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
          }}
        >
          <ShoppingBag size={44} color={COLORS.forest} strokeWidth={1.4} />
        </div>

        <div style={{ fontSize: 17, fontWeight: 700, color: COLORS.ink, marginBottom: 8 }}>
          Hozircha faol buyurtmalaringiz yo'q
        </div>
        <p style={{ fontSize: 14, color: COLORS.inkSoft, lineHeight: 1.5, margin: 0, maxWidth: 320 }}>
          {EMPTY_TEXT[activeTab]}
        </p>
      </div>
    </div>
  );
}
