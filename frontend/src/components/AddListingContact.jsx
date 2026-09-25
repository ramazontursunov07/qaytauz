import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, MessageCircle, Phone, Send } from "lucide-react";
import { API_URL } from "../config";

const COLORS = {
  forest: "#2F6B4F",
  inkSoft: "#5B6459",
  chipBg: "#F1F1F1",
  pink: "#B4126E",
};

const API_BASE = API_URL;

export default function AddListingContact() {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const prevState = routerLocation.state || {};

  const [name, setName] = useState(prevState.contactName || "");
  const [phoneCall, setPhoneCall] = useState(prevState.phoneCall || false);
  const [telegramChat, setTelegramChat] = useState(prevState.telegramChat || false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    fetch(`${API_BASE}/api/users/profile/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setPhoneNumber(data.phone_number || "");
          if (!prevState.contactName) setName(data.username || "");
        }
      })
      .catch(() => {});
  }, []);

  const canSubmit = name.trim().length > 0 && (phoneCall || telegramChat);

  // Bosqichlarda tanlangan holat qiymatini (yangidek/izlari_bor/...) backend
  // modelidagi haqiqiy tanlovlarga ('Yangi' yoki 'Ishlatilgan') moslashtiramiz.
  const mapCondition = (value) => (value === "yangi" ? "Yangi" : "Ishlatilgan");

  const handleSubmit = async () => {
    if (!canSubmit) return;

    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/kirish");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const formData = new FormData();
      formData.append("title", prevState.title || "");
      formData.append("description", prevState.description || "");
      formData.append("price", String(prevState.price || 0));
      formData.append("condition", mapCondition(prevState.condition));

      if (prevState.category) {
        formData.append("category", String(prevState.category));
      }

      formData.append("region", prevState.searchLocation || "");
      // "Kuryer orqali yuborishga tayyor" tugmasi — aynan shu qiymat
      // backend'dagi haqiqiy `free_delivery` maydoniga yozilishi kerak,
      // aks holda bosh sahifadagi "Berib yuborishadi (Bepul)" filtri
      // hech qachon hech narsa topa olmaydi.
      formData.append("free_delivery", String(!!prevState.courierReady));

      formData.append(
        "extra_info",
        JSON.stringify({
          currency: prevState.currency || "som",
          priceNegotiable: !!prevState.priceNegotiable,
          audience: prevState.audience || null,
          conditionDetail: prevState.condition || null,
          categoryName: prevState.categoryName || null,
          landmark: prevState.landmark || "",
          courierReady: !!prevState.courierReady,
          contactName: name,
          phoneCall,
          telegramChat,
        })
      );

      if (prevState.attributeValuesList && prevState.attributeValuesList.length > 0) {
        formData.append("attribute_values", JSON.stringify(prevState.attributeValuesList));
      }

      // Rasmlarni multipart/form-data orqali qo'shamiz
      (prevState.images || []).forEach((img) => {
        if (img.file) formData.append("images", img.file);
      });

      const res = await fetch(`${API_BASE}/api/products/create/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        navigate("/kirish");
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const firstKey = data ? Object.keys(data)[0] : null;
        let msg = firstKey
          ? Array.isArray(data[firstKey])
            ? data[firstKey][0]
            : String(data[firstKey])
          : null;
        // Backend'ning texnik (inglizcha) xabarlarini tushunarli qilib almashtiramiz
        if (firstKey === "price" && msg && msg.toLowerCase().includes("digits")) {
          msg = "Narx juda katta kiritildi. Iltimos, kichikroq raqam kiriting.";
        }
        throw new Error(msg || "E'lonni saqlashda xatolik yuz berdi");
      }

      navigate("/sotish");
    } catch (err) {
      console.error("E'lon yuborishda xatolik:", err);
      setSubmitError(
        err.message || "E'lonni saqlashda xatolik yuz berdi. Server bilan aloqa yo'q bo'lishi mumkin."
      );
    } finally {
      setSubmitting(false);
    }
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
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20 }}
        >
          ←
        </button>
        <button
          onClick={() => navigate("/sotish")}
          style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.inkSoft, fontSize: 15 }}
        >
          Saqlash va chiqish
        </button>
      </div>

      <div style={{ padding: "12px 20px 0" }}>
        <h1 style={{ fontSize: 21, fontWeight: 800, margin: "0 0 24px", color: "#1A1A1A", lineHeight: 1.3 }}>
          Aloqa uchun profil ma'lumotlari va kontaktlar
        </h1>

        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, color: "#1A1A1A" }}>Ism</div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: COLORS.chipBg,
            borderRadius: 14,
            padding: "14px 16px",
            marginBottom: 28,
          }}
        >
          <Search size={18} color={COLORS.inkSoft} />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ism"
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

        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: "#1A1A1A" }}>
          Siz bilan bog'lanish usullari
        </div>
        <div style={{ fontSize: 12.5, color: COLORS.inkSoft, marginBottom: 12 }}>
          Kamida bitta usulni yoqing (telefon yoki telegram)
        </div>

        {/* Chat QaytaUz — sukut bo'yicha yoqilgan, o'chirib bo'lmaydi */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            background: COLORS.chipBg,
            borderRadius: 14,
            padding: "14px 16px",
            marginBottom: 10,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "#2FAE5C",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <MessageCircle size={18} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14.5, fontWeight: 600, color: "#1A1A1A" }}>Chat QaytaUz</div>
            <div style={{ fontSize: 12.5, color: COLORS.inkSoft }}>Sukut bo'yicha yoqilgan</div>
          </div>
        </div>

        {/* Telefon orqali qo'ng'iroq */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            background: COLORS.chipBg,
            borderRadius: 14,
            padding: "14px 16px",
            marginBottom: 10,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: COLORS.pink,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Phone size={18} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14.5, fontWeight: 600, color: "#1A1A1A" }}>
              Telefon orqali qo'ng'iroq qilish
            </div>
          </div>
          <button
            onClick={() => setPhoneCall((v) => !v)}
            style={{
              width: 40,
              height: 22,
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              background: phoneCall ? COLORS.forest : "#CFCFCF",
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
                left: phoneCall ? 20 : 2,
                transition: "left 0.15s",
              }}
            />
          </button>
        </div>

        {/* Telegramda suhbat */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            background: COLORS.chipBg,
            borderRadius: 14,
            padding: "14px 16px",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "#29A9E0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Send size={16} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14.5, fontWeight: 600, color: "#1A1A1A" }}>
              Telegramda suhbat
            </div>
            <div style={{ fontSize: 12.5, color: COLORS.inkSoft }}>
              raqam bo'yicha {phoneNumber}
            </div>
          </div>
          <button
            onClick={() => setTelegramChat((v) => !v)}
            style={{
              width: 40,
              height: 22,
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              background: telegramChat ? COLORS.forest : "#CFCFCF",
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
                left: telegramChat ? 20 : 2,
                transition: "left 0.15s",
              }}
            />
          </button>
        </div>

        {!phoneCall && !telegramChat && (
          <div style={{ fontSize: 13, color: "#C0392B", marginBottom: 12 }}>
            Davom etish uchun kamida bitta bog'lanish usulini yoqing
          </div>
        )}

        {submitError && (
          <div style={{ fontSize: 13, color: "#C0392B", marginBottom: 12 }}>{submitError}</div>
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
          onClick={handleSubmit}
          disabled={submitting || !canSubmit}
          style={{
            width: "100%",
            background: !canSubmit ? "#B7CFC0" : COLORS.forest,
            color: "white",
            border: "none",
            borderRadius: 28,
            padding: "16px 0",
            fontSize: 16,
            fontWeight: 700,
            cursor: !canSubmit ? "not-allowed" : "pointer",
          }}
        >
          {submitting ? "Yuborilmoqda..." : "E'lon berish"}
        </button>
      </div>
    </div>
  );
}
