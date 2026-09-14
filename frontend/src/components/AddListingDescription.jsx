import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const COLORS = {
  forest: "#2F6B4F",
  inkSoft: "#5B6459",
  chipBg: "#F1F1F1",
};

cohttp://localhost:8000nst MAX_LENGTH = 1000;

export default function AddListingDescription() {
  const navigate = useNavigate();
  const location = useLocation();
  const prevState = location.state || {};

  const [description, setDescription] = useState(prevState.description || "");

  const canContinue = description.trim().length > 0;

  const handleContinue = () => {
    if (!canContinue) return;
    navigate("/sotish/joylashuv", {
      state: { ...prevState, description },
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
          Tavsif qo'shing
        </h1>

        <textarea
          value={description}
          onChange={(e) => {
            if (e.target.value.length <= MAX_LENGTH) {
              setDescription(e.target.value);
            }
          }}
          placeholder="Masalan, zo'r holatdagi muzlatgichni sotaman"
          style={{
            width: "100%",
            boxSizing: "border-box",
            background: COLORS.chipBg,
            border: "none",
            borderRadius: 14,
            padding: 16,
            fontSize: 15,
            outline: "none",
            resize: "none",
            minHeight: 160,
            fontFamily: "inherit",
          }}
        />

        <div style={{ textAlign: "right", color: COLORS.inkSoft, fontSize: 13, marginTop: 6 }}>
          {description.length}/{MAX_LENGTH}
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
