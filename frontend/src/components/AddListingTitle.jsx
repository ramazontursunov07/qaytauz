import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const COLORS = {
  forest: "#2F6B4F",
  inkSoft: "#5B6459",
  line: "#E1DACB",
  placeholder: "#F1F1F1",
};

const MAX_LENGTH = 50;

export default function AddListingTitle() {
  const navigate = useNavigate();
  const location = useLocation();
  const prevState = location.state || {};

  const [title, setTitle] = useState(prevState.title || "");

  const handleContinue = () => {
    if (!title.trim()) return;
    navigate("/sotish/kategoriya", { state: { ...prevState, title } });
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
        <h1 style={{ fontSize: 21, fontWeight: 800, margin: "0 0 18px", color: "#1A1A1A" }}>
          E'lon sarlavhasini kiriting
        </h1>

        <input
          type="text"
          value={title}
          maxLength={MAX_LENGTH}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Masalan, Macbook Pro"
          style={{
            width: "100%",
            boxSizing: "border-box",
            background: COLORS.placeholder,
            border: "none",
            borderRadius: 14,
            padding: "16px 16px",
            fontSize: 15,
            outline: "none",
            color: "#08060d",
          }}
        />
        <div
          style={{
            textAlign: "right",
            fontSize: 13,
            color: COLORS.inkSoft,
            marginTop: 8,
            paddingBottom: 12,
            borderBottom: `1px solid ${COLORS.line}`,
          }}
        >
          {title.length}/{MAX_LENGTH}
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
          disabled={!title.trim()}
          style={{
            width: "100%",
            background: !title.trim() ? "#B7CFC0" : COLORS.forest,
            color: "white",
            border: "none",
            borderRadius: 28,
            padding: "16px 0",
            fontSize: 16,
            fontWeight: 700,
            cursor: !title.trim() ? "not-allowed" : "pointer",
          }}
        >
          Davom ettirish
        </button>
      </div>
    </div>
  );
}
