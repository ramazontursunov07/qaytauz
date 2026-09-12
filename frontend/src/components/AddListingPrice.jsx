import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, AlarmClock } from "lucide-react";

const COLORS = {
  forest: "#2F6B4F",
  inkSoft: "#5B6459",
  line: "#E1DACB",
  chipBg: "#F1F1F1",
  chipActive: "#1A1A1A",
};

export default function AddListingPrice() {
  const navigate = useNavigate();
  const location = useLocation();
  const prevState = location.state || {};

  const [term, setTerm] = useState("belgilang"); // "belgilang" | "tekinga"
  const [currency, setCurrency] = useState("som"); // "som" | "ye"
  const [price, setPrice] = useState("");
  const [priceNegotiable, setPriceNegotiable] = useState(false);

  const isFree = term === "tekinga";
  const canContinue = isFree || priceNegotiable || (price && Number(price) > 0);

  const handleContinue = () => {
    if (!canContinue) return;
    navigate("/sotish/xususiyat", {
      state: { ...prevState, price: isFree ? 0 : price, currency, priceNegotiable },
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
          Bitim shartlarini ko'rsating
        </h1>

        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, color: "#1A1A1A" }}>
          Shartlar
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
          <button
            onClick={() => setTerm("belgilang")}
            style={{
              padding: "12px 18px",
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              textAlign: "left",
              fontSize: 14.5,
              fontWeight: 600,
              background: term === "belgilang" ? COLORS.chipActive : COLORS.chipBg,
              color: term === "belgilang" ? "white" : "#1A1A1A",
              width: "fit-content",
            }}
          >
            Narxni belgilang
          </button>
          <button
            onClick={() => setTerm("tekinga")}
            style={{
              padding: "12px 18px",
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              textAlign: "left",
              fontSize: 14.5,
              fontWeight: 600,
              background: term === "tekinga" ? COLORS.chipActive : COLORS.chipBg,
              color: term === "tekinga" ? "white" : "#1A1A1A",
              width: "fit-content",
            }}
          >
            Men uni tekinga beraman
          </button>
        </div>

        {!isFree && (
          <>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, color: "#1A1A1A" }}>
              Narxi
            </div>

            <div
              style={{
                display: "flex",
                background: COLORS.chipBg,
                borderRadius: 14,
                padding: 4,
                marginBottom: 12,
              }}
            >
              <button
                onClick={() => setCurrency("som")}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  border: "none",
                  borderRadius: 12,
                  cursor: "pointer",
                  fontSize: 14.5,
                  fontWeight: 700,
                  background: currency === "som" ? "white" : "transparent",
                  color: "#1A1A1A",
                }}
              >
                So'm
              </button>
              <button
                onClick={() => setCurrency("ye")}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  border: "none",
                  borderRadius: 12,
                  cursor: "pointer",
                  fontSize: 14.5,
                  fontWeight: 700,
                  background: currency === "ye" ? "white" : "transparent",
                  color: "#1A1A1A",
                }}
              >
                y.e.
              </button>
            </div>

            <input
              type="text"
              inputMode="numeric"
              value={price}
              onChange={(e) => {
                const onlyDigits = e.target.value.replace(/\D/g, "");
                setPrice(onlyDigits);
              }}
              disabled={priceNegotiable}
              placeholder="0"
              style={{
                width: "100%",
                boxSizing: "border-box",
                background: priceNegotiable ? "#E7E7E7" : COLORS.chipBg,
                border: "none",
                borderRadius: 14,
                padding: "16px 16px",
                fontSize: 15,
                outline: "none",
                marginBottom: 16,
                color: priceNegotiable ? COLORS.inkSoft : "#1A1A1A",
              }}
            />

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
                <AlarmClock size={22} color={COLORS.forest} />
                <span style={{ fontSize: 14.5, color: "#1A1A1A" }}>Narxi kelishiladi</span>
              </div>
              <button
                onClick={() => setPriceNegotiable((v) => !v)}
                style={{
                  width: 40,
                  height: 22,
                  borderRadius: 999,
                  border: "none",
                  cursor: "pointer",
                  background: priceNegotiable ? COLORS.forest : "#CFCFCF",
                  position: "relative",
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
                    left: priceNegotiable ? 20 : 2,
                    transition: "left 0.15s",
                  }}
                />
              </button>
            </div>
          </>
        )}
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
