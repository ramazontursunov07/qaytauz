import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MoreHorizontal, User, Share2, FileText, Pencil, Loader2 } from "lucide-react";
import { BigFace, getPresetAvatar } from "./PresetAvatars";
import { API_BASE, authFetch, isLoggedIn } from "../utils/auth";

const COLORS = {
  forest: "#2F6B4F",
  ink: "#1F2A1E",
  inkSoft: "#5B6459",
  line: "#E1DACB",
  chipBg: "#F1F1F1",
  pink: "#B4126E",
};

export default function PublicProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [tab, setTab] = useState("faol");
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isOwn, setIsOwn] = useState(!id);
  const [targetId, setTargetId] = useState(id ? Number(id) : null);
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [user, setUser] = useState({
    name: "",
    joinedDate: "",
    listingsCount: 0,
    subscribersCount: 0,
    rating: 0,
    avatar: null,
    avatarPreset: null,
  });

  useEffect(() => {
    // Boshqa foydalanuvchining profili (chatdagi "Profilga o'tish" orqali) —
    // token bo'lmasa ham ko'rish mumkin, chunki bu ochiq (public) profil.
    // Token bo'lsa, authFetch bilan so'raymiz — shunda "obuna bo'lganmanmi"
    // degan haqiqiy holat (is_subscribed) ham qaytadi.
    if (id) {
      setIsOwn(false);
      setTargetId(Number(id));
      const fetcher = isLoggedIn() ? authFetch : fetch;
      fetcher(`${API_BASE}/api/users/public/${id}/`)
        .then((res) => (res.ok ? res.json() : null))
        .then((pub) => {
          if (!pub) throw new Error();
          setUser({
            name: pub.username || "",
            joinedDate: pub.joined_date || "",
            listingsCount: pub.listings_count ?? 0,
            subscribersCount: pub.subscribers_count ?? 0,
            rating: 0,
            avatar: pub.avatar || null,
            avatarPreset: pub.avatar_preset || null,
          });
          setSubscribed(!!pub.is_subscribed);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
      return;
    }

    // O'zining profili
    setIsOwn(true);
    if (!isLoggedIn()) {
      navigate("/kirish", { state: { from: "/profil/korinish" } });
      return;
    }

    authFetch(`${API_BASE}/api/users/profile/`)
      .then((res) => {
        if (res.status === 401) {
          navigate("/kirish", { state: { from: "/profil/korinish" } });
          return null;
        }
        if (!res.ok) throw new Error("Profilni yuklab bo'lmadi");
        return res.json();
      })
      .then((me) => {
        if (!me) return null;
        setTargetId(me.id);
        // O'zining haqiqiy statistikasini (e'lonlar soni va h.k.) olish uchun
        // public profil endpoint'iga murojaat qilamiz.
        return authFetch(`${API_BASE}/api/users/public/${me.id}/`)
          .then((res) => (res.ok ? res.json() : null))
          .then((pub) => {
            setUser({
              name: me.username || "",
              joinedDate: pub?.joined_date || "",
              listingsCount: pub?.listings_count ?? 0,
              subscribersCount: pub?.subscribers_count ?? 0,
              rating: 0,
              avatar: me.avatar || null,
              avatarPreset: me.avatar_preset || null,
            });
          });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleToggleSubscribe = () => {
    if (!isLoggedIn()) {
      navigate("/kirish");
      return;
    }
    if (!targetId) return;
    setSubscribing(true);
    authFetch(`${API_BASE}/api/users/subscribe/${targetId}/`, {
      method: subscribed ? "DELETE" : "POST",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) throw new Error();
        setSubscribed(!!data.subscribed);
        setUser((u) => ({ ...u, subscribersCount: data.subscribers_count ?? u.subscribersCount }));
      })
      .catch(() => {
        alert("Amalni bajarib bo'lmadi, qaytadan urinib ko'ring.");
      })
      .finally(() => setSubscribing(false));
  };

  const handleShareProfile = async () => {
    setMenuOpen(false);
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: user.name, url: shareUrl });
      } catch (e) {
        // foydalanuvchi ulashishni bekor qilgan bo'lishi mumkin — e'tiborsiz qoldiramiz
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert("Profil havolasi nusxalandi");
      } catch (e) {
        alert(shareUrl);
      }
    }
  };

  const handleEditFromMenu = () => {
    setMenuOpen(false);
    navigate("/profil/tahrirlash");
  };

  return (
    <div style={{ minHeight: "100vh", background: "white", paddingBottom: 40, position: "relative" }}>
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
          <ArrowLeft size={22} color={COLORS.ink} />
        </button>
        <button
          onClick={() => setMenuOpen(true)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
        >
          <MoreHorizontal size={22} color={COLORS.ink} />
        </button>
      </div>

      {loading ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            color: COLORS.inkSoft,
            padding: 40,
          }}
        >
          <Loader2 size={18} className="qaytauz-spin" />
          Yuklanmoqda...
        </div>
      ) : (
      <div style={{ padding: "8px 20px 0" }}>
        {/* Avatar + name */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: COLORS.chipBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : user.avatarPreset && getPresetAvatar(user.avatarPreset) ? (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background: getPresetAvatar(user.avatarPreset).bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BigFace Face={getPresetAvatar(user.avatarPreset).Face} size={38} />
              </div>
            ) : (
              <User size={26} color={COLORS.inkSoft} />
            )}
          </div>
          <div>
            <div style={{ fontSize: 19, fontWeight: 800, color: COLORS.ink }}>{user.name}</div>
            <div style={{ fontSize: 13.5, color: COLORS.inkSoft }}>
              Ro'yxatdan o'tgan {user.joinedDate}
            </div>
          </div>
        </div>

        {/* Stat boxes */}
        <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          <div
            style={{
              flex: 1,
              border: `1px solid ${COLORS.line}`,
              borderRadius: 14,
              padding: "14px 10px",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.ink }}>
              {user.listingsCount}
            </div>
            <div style={{ fontSize: 12.5, color: COLORS.inkSoft }}>E'lonlar</div>
          </div>
          <div
            style={{
              flex: 1,
              border: `1px solid ${COLORS.line}`,
              borderRadius: 14,
              padding: "14px 10px",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.ink }}>
              {user.subscribersCount}
            </div>
            <div style={{ fontSize: 12.5, color: COLORS.inkSoft }}>Obunachilar</div>
          </div>
          <div
            style={{
              flex: 1,
              border: `1px solid ${COLORS.line}`,
              borderRadius: 14,
              padding: "14px 10px",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.ink }}>
              {user.rating.toFixed(1)}
            </div>
            <div style={{ fontSize: 12.5, color: COLORS.inkSoft }}>
              {user.rating === 0 ? "Sharhlar yo'q" : "Reyting"}
            </div>
          </div>
        </div>

        {/* Tahrirlash + Share — o'z profilida; Obuna bo'lish + Share — boshqa foydalanuvchida */}
        <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          {isOwn ? (
            <button
              onClick={() => navigate("/profil/tahrirlash")}
              style={{
                flex: 1,
                background: COLORS.chipBg,
                border: "none",
                borderRadius: 14,
                padding: "14px 0",
                fontSize: 15,
                fontWeight: 700,
                color: COLORS.ink,
                cursor: "pointer",
              }}
            >
              Tahrirlash
            </button>
          ) : (
            <button
              onClick={handleToggleSubscribe}
              disabled={subscribing}
              style={{
                flex: 1,
                background: subscribed ? COLORS.chipBg : COLORS.pink,
                border: "none",
                borderRadius: 14,
                padding: "14px 0",
                fontSize: 15,
                fontWeight: 700,
                color: subscribed ? COLORS.ink : "white",
                cursor: subscribing ? "not-allowed" : "pointer",
                opacity: subscribing ? 0.7 : 1,
              }}
            >
              {subscribing ? "..." : subscribed ? "Obuna bo'lingan" : "Obuna bo'lish"}
            </button>
          )}
          <button
            onClick={handleShareProfile}
            style={{
              width: 52,
              flex: "none",
              background: COLORS.chipBg,
              border: "none",
              borderRadius: 14,
              padding: "14px 0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <Share2 size={18} color={COLORS.ink} />
          </button>
        </div>

        {/* Faol / Arxiv tabs */}
        <div style={{ display: "flex", borderBottom: `1px solid ${COLORS.line}` }}>
          <button
            onClick={() => setTab("faol")}
            style={{
              flex: 1,
              padding: "12px 0",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 15,
              fontWeight: 700,
              color: tab === "faol" ? COLORS.ink : COLORS.inkSoft,
              borderBottom: tab === "faol" ? `2px solid ${COLORS.ink}` : "2px solid transparent",
            }}
          >
            Faol
          </button>
          <button
            onClick={() => setTab("arxiv")}
            style={{
              flex: 1,
              padding: "12px 0",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 15,
              fontWeight: 700,
              color: tab === "arxiv" ? COLORS.ink : COLORS.inkSoft,
              borderBottom: tab === "arxiv" ? `2px solid ${COLORS.ink}` : "2px solid transparent",
            }}
          >
            Arxiv
          </button>
        </div>

        {/* Empty state */}
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <FileText size={64} color={COLORS.line} strokeWidth={1.2} style={{ marginBottom: 16 }} />
          <div style={{ fontSize: 14.5, color: COLORS.inkSoft }}>
            {tab === "faol"
              ? "Foydalanuvchida faol e'lonlar yo'q"
              : "Foydalanuvchida arxivlangan e'lonlar yo'q"}
          </div>
        </div>
      </div>
      )}

      {/* "..." bosilganda chiqadigan pastki varaq */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            zIndex: 100,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 480,
              background: "white",
              borderRadius: "20px 20px 0 0",
              padding: "8px 12px calc(env(safe-area-inset-bottom, 0px) + 16px)",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                width: 40,
                height: 4,
                background: COLORS.line,
                borderRadius: 999,
                margin: "6px auto 14px",
              }}
            />

            {isOwn && (
              <button
                onClick={handleEditFromMenu}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: "none",
                  border: "none",
                  padding: "14px 12px",
                  fontSize: 16,
                  fontWeight: 600,
                  color: COLORS.ink,
                  cursor: "pointer",
                  borderBottom: `1px solid ${COLORS.line}`,
                }}
              >
                <Pencil size={20} color={COLORS.forest} />
                Tahrirlash
              </button>
            )}

            <button
              onClick={handleShareProfile}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: "none",
                border: "none",
                padding: "14px 12px",
                fontSize: 16,
                fontWeight: 600,
                color: COLORS.ink,
                cursor: "pointer",
                borderBottom: `1px solid ${COLORS.line}`,
              }}
            >
              <Share2 size={20} color={COLORS.forest} />
              Profilni ulashish
            </button>

            <button
              onClick={() => setMenuOpen(false)}
              style={{
                width: "100%",
                textAlign: "center",
                background: "none",
                border: "none",
                padding: "14px 12px",
                marginTop: 4,
                fontSize: 16,
                fontWeight: 700,
                color: COLORS.inkSoft,
                cursor: "pointer",
              }}
            >
              Bekor qilish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
