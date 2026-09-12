import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const COLORS = {
  forest: "#2F6B4F",
  ink: "#1A1A1A",
  inkSoft: "#5B6459",
  line: "#E1DACB",
  cream: "#FAF6EE",
};

const STORAGE_KEY = "qaytauz_notification_settings";

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { important: false, promotions: false };
    const parsed = JSON.parse(raw);
    return {
      important: !!parsed.important,
      promotions: !!parsed.promotions,
    };
  } catch (e) {
    return { important: false, promotions: false };
  }
}

function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    // localStorage mavjud bo'lmasa yoki to'lib qolgan bo'lsa, jimgina o'tkazib yuboramiz
  }
}

function ToggleRow({ title, subtitle, checked, onToggle }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 16,
        padding: "16px 18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 14,
        marginBottom: 12,
      }}
    >
      <div>
        <div style={{ fontSize: 15.5, fontWeight: 700, color: COLORS.ink, marginBottom: 4 }}>
          {title}
        </div>
        <div style={{ fontSize: 13, color: COLORS.inkSoft, lineHeight: 1.4 }}>{subtitle}</div>
      </div>
      <button
        onClick={onToggle}
        style={{
          width: 44,
          height: 24,
          borderRadius: 999,
          border: "none",
          cursor: "pointer",
          background: checked ? COLORS.forest : "#CFCFCF",
          position: "relative",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "white",
            position: "absolute",
            top: 2,
            left: checked ? 22 : 2,
            transition: "left 0.15s",
          }}
        />
      </button>
    </div>
  );
}

export default function NotificationSettings() {
  const navigate = useNavigate();

  // Boshlang'ich holatni to'g'ridan-to'g'ri localStorage'dan o'qiymiz,
  // shunda sahifa qayta ochilganda ham oldingi tanlov saqlanib qoladi.
  const [important, setImportant] = useState(() => loadSettings().important);
  const [promotions, setPromotions] = useState(() => loadSettings().promotions);

  // Har safar qiymat o'zgarganda darhol localStorage'ga yozib qo'yamiz.
  useEffect(() => {
    saveSettings({ important, promotions });
  }, [important, promotions]);

  return (
    <div style={{ background: "#F2F2F2", minHeight: "100vh" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "16px 20px",
          background: COLORS.cream,
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
        >
          <ArrowLeft size={22} color={COLORS.ink} />
        </button>
        <h1
          style={{
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: "0.3px",
            margin: 0,
            color: COLORS.ink,
          }}
        >
          Bildirishnomalar sozlamalari
        </h1>
      </div>

      <div style={{ padding: "20px 16px" }}>
        <ToggleRow
          title="Muhim bildirishnomalar"
          subtitle="Buyurtma holatlari, yetkazmalar va xabarlar"
          checked={important}
          onToggle={() => setImportant((v) => !v)}
        />
        <ToggleRow
          title="Aksiyalar va takliflar"
          subtitle="Tanlovlar, chegirmalar va tavsiyalar"
          checked={promotions}
          onToggle={() => setPromotions((v) => !v)}
        />
      </div>
    </div>
  );
}
