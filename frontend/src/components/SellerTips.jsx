import { useNavigate } from "react-router-dom";
import { ArrowLeft, PiggyBank, ShieldCheck } from "lucide-react";

const COLORS = {
  forest: "#2F6B4F",
  cardBg: "#DCEEF7",
  ink: "#1A1A1A",
};

const TIPS = [
  {
    title: "Osongina sotish\nva daromad olish!",
    icon: PiggyBank,
    path: "/sotish/qollanma/sotish",
  },
  {
    title: "Sotuvchining\nxavfsizligi",
    icon: ShieldCheck,
    path: "/sotish/qollanma/xavfsizlik",
  },
];

export default function SellerTips() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", background: "white", paddingBottom: 40 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "16px 20px 12px",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
        >
          <ArrowLeft size={22} color={COLORS.ink} />
        </button>
        <h1 style={{ fontSize: 19, fontWeight: 800, margin: 0, color: COLORS.ink }}>
          Foydali ma'lumotlar
        </h1>
      </div>

      <div style={{ padding: "8px 20px 0", display: "flex", flexDirection: "column", gap: 16 }}>
        {TIPS.map(({ title, icon: Icon, path }) => (
          <div
            key={title}
            style={{
              background: COLORS.cardBg,
              borderRadius: 18,
              padding: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 17,
                  color: COLORS.ink,
                  lineHeight: 1.3,
                  marginBottom: 14,
                  whiteSpace: "pre-line",
                }}
              >
                {title}
              </div>
              <button
                onClick={() => path && navigate(path)}
                style={{
                  background: "white",
                  border: "none",
                  borderRadius: 999,
                  padding: "8px 14px",
                  fontSize: 13.5,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  cursor: "pointer",
                  color: COLORS.ink,
                }}
              >
                Qo'llanma
                <span
                  style={{
                    background: COLORS.forest,
                    color: "white",
                    borderRadius: "50%",
                    width: 18,
                    height: 18,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                  }}
                >
                  ↗
                </span>
              </button>
            </div>
            <Icon size={64} color={COLORS.forest} strokeWidth={1.2} />
          </div>
        ))}
      </div>
    </div>
  );
}
