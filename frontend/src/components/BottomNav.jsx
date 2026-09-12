import { useNavigate, useLocation } from "react-router-dom";
import { Search, Heart, PlusCircle, MessageCircle, User } from "lucide-react";

const COLORS = {
  forest: "#2F6B4F",
  inkSoft: "#5B6459",
  line: "#E1DACB",
};

const navItems = [
  { icon: Search, label: "Qidiruv", path: "/" },
  { icon: Heart, label: "Sevimlilar", path: "/sevimlilar" },
  { icon: PlusCircle, label: "Sotish", path: "/sotish" },
  { icon: MessageCircle, label: "Xabarlar", path: "/xabarlar" },
  { icon: User, label: "Profil", path: "/profil" },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: 1000,
        background: "white",
        borderTop: `1px solid ${COLORS.line}`,
        padding: "10px 8px",
        boxSizing: "border-box",
        zIndex: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
        {navItems.map(({ icon: Icon, label, path }) => {
          const active = location.pathname === path;
          return (
            <button
              key={label}
              onClick={() => navigate(path)}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                border: "none",
                background: "transparent",
                padding: "4px 4px",
                cursor: "pointer",
                color: active ? COLORS.forest : COLORS.inkSoft,
              }}
            >
              <Icon size={20} fill={active ? COLORS.forest : "none"} />
              <span style={{ fontSize: 10.5, fontWeight: 600 }}>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
