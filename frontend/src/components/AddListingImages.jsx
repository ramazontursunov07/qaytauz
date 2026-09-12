import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Camera, X } from "lucide-react";

const COLORS = {
  forest: "#2F6B4F",
  inkSoft: "#5B6459",
  line: "#E1DACB",
  tipBg: "#DCEEF7",
};

const MAX_IMAGES = 10;

export default function AddListingImages() {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [showSheet, setShowSheet] = useState(false);

  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const remainingSlots = MAX_IMAGES - images.length;
    const accepted = files.slice(0, remainingSlots).map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...accepted]);
    e.target.value = "";
    setShowSheet(false);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleContinue = () => {
    if (images.length === 0) return;
    navigate("/sotish/sarlavha", { state: { images } });
  };

  return (
    <div style={{ minHeight: "100vh", background: "white", paddingBottom: 100 }}>
      {/* Top bar */}
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
          Yopish
        </button>
      </div>

      <div style={{ padding: "8px 20px 0" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 10px", color: "#1A1A1A" }}>
          E'lonning rasmini qo'shing
        </h1>
        <p style={{ fontSize: 14.5, color: COLORS.inkSoft, lineHeight: 1.5, margin: "0 0 20px" }}>
          1 dan {MAX_IMAGES} gacha rasm qo'shish mumkin. Rasm hajmi 10 MB dan
          oshmasligi va o'lchami kamida 300×300 bo'lishi kerak.
        </p>

        {/* Tip banner */}
        <div
          style={{
            background: COLORS.tipBg,
            borderRadius: 16,
            padding: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: 15.5, marginBottom: 10, color: "#1A1A1A" }}>
              Qanday mukammal
              <br />
              surat olish
            </div>
            <button
              style={{
                background: "white",
                border: "none",
                borderRadius: 999,
                padding: "8px 14px",
                fontSize: 13,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 6,
                cursor: "pointer",
              }}
            >
              Tavsiyalarni ko'rish
              <span
                style={{
                  background: COLORS.forest,
                  color: "white",
                  borderRadius: "50%",
                  width: 16,
                  height: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                }}
              >
                ↗
              </span>
            </button>
          </div>
          <Camera size={54} color={COLORS.forest} strokeWidth={1.2} />
        </div>

        {/* Image grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 10,
          }}
        >
          {images.map((img, i) => (
            <div
              key={i}
              style={{
                position: "relative",
                aspectRatio: "1 / 1",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <img
                src={img.url}
                alt={`rasm-${i}`}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <button
                onClick={() => removeImage(i)}
                style={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  background: "rgba(0,0,0,0.55)",
                  border: "none",
                  borderRadius: "50%",
                  width: 22,
                  height: 22,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X size={13} color="white" />
              </button>
              {i === 0 && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 4,
                    left: 4,
                    background: COLORS.forest,
                    color: "white",
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 6px",
                    borderRadius: 6,
                  }}
                >
                  Asosiy
                </div>
              )}
            </div>
          ))}

          {images.length < MAX_IMAGES && (
            <button
              onClick={() => setShowSheet(true)}
              style={{
                aspectRatio: "1 / 1",
                borderRadius: 12,
                background: "#F1F1F1",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <Plus size={28} color="#1A1A1A" />
            </button>
          )}
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {/* Action sheet */}
      {showSheet && (
        <div
          onClick={() => setShowSheet(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 100,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 480,
              padding: "0 16px 16px",
              boxSizing: "border-box",
            }}
          >
            <div style={{ background: "white", borderRadius: 16, overflow: "hidden", marginBottom: 10 }}>
              <button
                onClick={() => cameraInputRef.current?.click()}
                style={{
                  width: "100%",
                  padding: "16px 0",
                  background: "none",
                  border: "none",
                  borderBottom: `1px solid ${COLORS.line}`,
                  fontSize: 16,
                  color: "#1A1A1A",
                  cursor: "pointer",
                }}
              >
                Kamera
              </button>
              <button
                onClick={() => galleryInputRef.current?.click()}
                style={{
                  width: "100%",
                  padding: "16px 0",
                  background: "none",
                  border: "none",
                  fontSize: 16,
                  color: "#1A1A1A",
                  cursor: "pointer",
                }}
              >
                Galereyadan tanlash
              </button>
            </div>
            <button
              onClick={() => setShowSheet(false)}
              style={{
                width: "100%",
                background: "white",
                borderRadius: 16,
                border: "none",
                padding: "16px 0",
                fontSize: 16,
                fontWeight: 700,
                color: "#C0392B",
                cursor: "pointer",
              }}
            >
              Bekor qilish
            </button>
          </div>
        </div>
      )}

      {/* Bottom continue button */}
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
          disabled={images.length === 0}
          style={{
            width: "100%",
            background: images.length === 0 ? "#B7CFC0" : COLORS.forest,
            color: "white",
            border: "none",
            borderRadius: 28,
            padding: "16px 0",
            fontSize: 16,
            fontWeight: 700,
            cursor: images.length === 0 ? "not-allowed" : "pointer",
          }}
        >
          Davom ettirish
        </button>
      </div>
    </div>
  );
}
