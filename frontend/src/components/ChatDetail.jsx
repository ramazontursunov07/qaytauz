import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Send,
  Phone,
  MoreHorizontal,
  Paperclip,
  MessageCircle,
  Camera,
  Image as ImageIcon,
  MapPin,
} from "lucide-react";
import { API_URL } from "../config";

const COLORS = {
  forest: "#2F6B4F",
  inkSoft: "#5B6459",
  line: "#E1DACB",
  cream: "#FAF6EE",
  pink: "#B4126E",
  ink: "#1F2A1E",
};

const API_BASE = API_URL;

const QUICK_REPLIES = [
  "Hali sotib yubormadingizmi?",
  "Bo'lishi qancha?",
  "Qanday ko'rsam bo'ladi?",
];

function authHeaders() {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function resolveImageUrl(url) {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
}

function formatMessageTime(isoDate) {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return "";
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${min}`;
}

export default function ChatDetail() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const bottomRef = useRef(null);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const [myId, setMyId] = useState(null);
  const [chat, setChat] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  const [autoTranslate, setAutoTranslate] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [attachMenuOpen, setAttachMenuOpen] = useState(false);
  const [sharingLocation, setSharingLocation] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [blockConfirmOpen, setBlockConfirmOpen] = useState(false);
  const [isBlockedByMe, setIsBlockedByMe] = useState(false);
  const [isBlockedMe, setIsBlockedMe] = useState(false);
  const [unblocking, setUnblocking] = useState(false);

  const loadChat = () => {
    return fetch(`${API_BASE}/api/chats/chat-detail/${chatId}/`, { headers: authHeaders() }).then((res) => {
      if (!res.ok) throw new Error("Suhbatni yuklab bo'lmadi");
      return res.json();
    });
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/kirish");
      return;
    }

    fetch(`${API_BASE}/api/users/profile/`, { headers: authHeaders() })
      .then((res) => (res.ok ? res.json() : null))
      .then((me) => {
        if (!me) throw new Error("Profil ma'lumotini olib bo'lmadi");
        setMyId(me.id);
        return loadChat();
      })
      .then((chatData) => {
        setChat(chatData);

        const requests = [];

        // Ikkinchi ishtirokchi (suhbatdosh)ni topamiz
        requests.push(
          fetch(`${API_BASE}/api/users/profile/`, { headers: authHeaders() })
            .then((res) => (res.ok ? res.json() : null))
            .then((me) => {
              const oId = (chatData.participants || []).find((p) => p !== me.id);
              if (!oId) return null;
              return fetch(`${API_BASE}/api/users/public/${oId}/`).then((res) => (res.ok ? res.json() : null));
            })
        );

        if (chatData.product) {
          requests.push(
            fetch(`${API_BASE}/api/products/${chatData.product}/`).then((res) => (res.ok ? res.json() : null))
          );
        } else {
          requests.push(Promise.resolve(null));
        }

        return Promise.all(requests);
      })
      .then(([otherUserData, productData]) => {
        setOtherUser(otherUserData);
        setProduct(productData);
        setLoading(false);
        // Suhbatdoshni avval bloklaganmizmi (yoki u bizni bloklaganmi) — shuni
        // tekshirib, mos holatni ko'rsatamiz.
        if (otherUserData?.id) {
          fetch(`${API_BASE}/api/users/block-status/${otherUserData.id}/`, { headers: authHeaders() })
            .then((res) => (res.ok ? res.json() : null))
            .then((status) => {
              if (status) {
                setIsBlockedByMe(!!status.blocked_by_me);
                setIsBlockedMe(!!status.blocked_me);
              }
            })
            .catch(() => {});
        }
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages?.length]);

  const sendText = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setSending(true);
    setSendError("");
    fetch(`${API_BASE}/api/chats/message-create/`, {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ chat: Number(chatId), text: trimmed }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Xabarni yuborib bo'lmadi");
        setText("");
        return loadChat();
      })
      .then((chatData) => setChat(chatData))
      .catch((err) => setSendError(err.message))
      .finally(() => setSending(false));
  };

  const handleSend = () => sendText(text);
  const handleQuickReply = (reply) => sendText(reply);

  const handleAttachClick = () => {
    setAttachMenuOpen(true);
  };

  const handleOpenCamera = () => {
    setAttachMenuOpen(false);
    cameraInputRef.current?.click();
  };

  const handleOpenGallery = () => {
    setAttachMenuOpen(false);
    galleryInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    // TODO: fayl/rasm biriktirib yuborish backend'da hali qo'llab-quvvatlanmaydi.
    if (e.target.files?.length) {
      alert("Fayl biriktirish hali qo'shilmagan — tez orada qo'shiladi.");
    }
    e.target.value = "";
  };

  const handleShareLocation = () => {
    setAttachMenuOpen(false);
    if (!navigator.geolocation) {
      alert("Qurilmangiz joylashuvni aniqlashni qo'llab-quvvatlamaydi.");
      return;
    }
    setSharingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const mapsUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
        sendText(`📍 Mening joylashuvim: ${mapsUrl}`);
        setSharingLocation(false);
      },
      () => {
        alert("Joylashuvni aniqlab bo'lmadi. Brauzer ruxsatini tekshiring.");
        setSharingLocation(false);
      }
    );
  };

  const handleGoToProfile = () => {
    setMenuOpen(false);
    if (otherUser?.id) navigate(`/foydalanuvchi/${otherUser.id}`);
  };

  const handleGoToSupport = () => {
    setMenuOpen(false);
    navigate("/yordam");
  };

  const handleBlockUser = () => {
    // "..." menyusini yopib, tasdiqlash oynasini ochamiz (native confirm() emas,
    // shu ilova ichidagi o'ziga xos ko'rinishdagi modal).
    setMenuOpen(false);
    setBlockConfirmOpen(true);
  };

  const confirmBlockUser = () => {
    if (!otherUser?.id) return;
    setBlocking(true);
    fetch(`${API_BASE}/api/users/block/`, {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ blocked: otherUser.id }),
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        setBlockConfirmOpen(false);
        setIsBlockedByMe(true);
      })
      .catch(() => {
        alert("Foydalanuvchini bloklab bo'lmadi, qaytadan urinib ko'ring.");
      })
      .finally(() => setBlocking(false));
  };

  const handleUnblock = () => {
    if (!otherUser?.id) return;
    setUnblocking(true);
    fetch(`${API_BASE}/api/users/block/${otherUser.id}/`, {
      method: "DELETE",
      headers: authHeaders(),
    })
      .then((res) => {
        if (!res.ok && res.status !== 204) throw new Error();
        setIsBlockedByMe(false);
      })
      .catch(() => {
        alert("Blokdan chiqarib bo'lmadi, qaytadan urinib ko'ring.");
      })
      .finally(() => setUnblocking(false));
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.inkSoft }}>
        Yuklanmoqda...
      </div>
    );
  }

  if (error || !chat) {
    return (
      <div style={{ minHeight: "100vh", padding: 20, textAlign: "center", color: "#C0392B" }}>
        Xatolik: {error || "Suhbat topilmadi"}
      </div>
    );
  }

  const hasMessages = (chat.messages || []).length > 0;

  return (
    <div style={{ minHeight: "100vh", background: COLORS.cream, display: "flex", flexDirection: "column", position: "relative" }}>
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 16px",
          background: "white",
          borderBottom: `1px solid ${COLORS.line}`,
        }}
      >
        <button onClick={() => navigate("/xabarlar")} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <ArrowLeft size={22} color={COLORS.ink} />
        </button>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "#EDEDED",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          {otherUser?.avatar ? (
            <img src={resolveImageUrl(otherUser.avatar)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <User size={20} color={COLORS.inkSoft} />
          )}
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#1A1A1A", flex: 1 }}>
          {otherUser?.username || "Foydalanuvchi"}
        </div>

        {otherUser?.phone_number && (
          <a
            href={`tel:${otherUser.phone_number}`}
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "#F1F1F1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Phone size={17} color={COLORS.ink} />
          </a>
        )}
        <button
          onClick={() => setMenuOpen(true)}
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "#F1F1F1",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <MoreHorizontal size={18} color={COLORS.ink} />
        </button>
      </div>

      {/* Product context */}
      {product && (
        <div
          onClick={() => navigate(`/mahsulot/${product.id}`)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 16px",
            background: "white",
            borderBottom: `1px solid ${COLORS.line}`,
            cursor: "pointer",
          }}
        >
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "#EDEDED", overflow: "hidden", flexShrink: 0 }}>
            {product.images?.[0]?.image && (
              <img
                src={resolveImageUrl(product.images[0].image)}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#1A1A1A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {product.title}
            </div>
            <div style={{ fontSize: 13.5, color: COLORS.inkSoft }}>
              {Number(product.price).toLocaleString("uz-UZ")} so'm
            </div>
          </div>
        </div>
      )}

      {/* Avtomatik tarjima */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          background: "white",
          borderBottom: `1px solid ${COLORS.line}`,
        }}
      >
        <span style={{ fontSize: 13.5, color: COLORS.ink }}>O'zbek tiliga avtomatik tarjima</span>
        <button
          onClick={() => setAutoTranslate((v) => !v)}
          style={{
            width: 40,
            height: 22,
            borderRadius: 999,
            border: "none",
            cursor: "pointer",
            background: autoTranslate ? COLORS.forest : "#CFCFCF",
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
              left: autoTranslate ? 20 : 2,
              transition: "left 0.15s",
            }}
          />
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {!hasMessages ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "0 30px",
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "#F6E4EF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 18,
              }}
            >
              <MessageCircle size={32} color={COLORS.pink} />
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#1A1A1A" }}>
              Tafsilotlarni sotuvchidan aniqlashtiring
            </div>
          </div>
        ) : (
          chat.messages.map((msg) => {
            const isMine = msg.sender === myId;
            return (
              <div key={msg.id} style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start" }}>
                <div
                  style={{
                    maxWidth: "75%",
                    background: isMine ? COLORS.forest : "white",
                    color: isMine ? "white" : "#1A1A1A",
                    borderRadius: 16,
                    borderBottomRightRadius: isMine ? 4 : 16,
                    borderBottomLeftRadius: isMine ? 16 : 4,
                    padding: "10px 14px",
                    fontSize: 14.5,
                    lineHeight: 1.4,
                  }}
                >
                  {msg.text}
                  <div
                    style={{
                      fontSize: 11,
                      marginTop: 4,
                      textAlign: "right",
                      color: isMine ? "rgba(255,255,255,0.75)" : COLORS.inkSoft,
                    }}
                  >
                    {formatMessageTime(msg.created_at)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {isBlockedByMe ? (
        /* Men bloklaganman — xabar yozish o'rniga shu ko'rsatiladi, blokdan chiqarish imkoni bilan */
        <div style={{ padding: 16 }}>
          <div
            style={{
              border: `1px solid ${COLORS.line}`,
              borderRadius: 16,
              padding: 18,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 14.5, color: "#1A1A1A", lineHeight: 1.5, marginBottom: 16 }}>
              Siz foydalanuvchini blokladingiz. Xabar yuborish va xabar qabul qilish imkonsiz
            </div>
            <button
              onClick={handleUnblock}
              disabled={unblocking}
              style={{
                width: "100%",
                background: "#E7F3FC",
                color: "#1471B8",
                border: "none",
                borderRadius: 14,
                padding: "14px 0",
                fontSize: 15,
                fontWeight: 700,
                cursor: unblocking ? "not-allowed" : "pointer",
                marginBottom: 10,
              }}
            >
              {unblocking ? "Blokdan chiqarilmoqda..." : "Blokdan chiqarish"}
            </button>
            <button
              onClick={() => navigate("/yordam")}
              style={{
                width: "100%",
                background: COLORS.cream,
                color: COLORS.ink,
                border: "none",
                borderRadius: 14,
                padding: "14px 0",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Yordam xizmatiga yozish
            </button>
          </div>
        </div>
      ) : isBlockedMe ? (
        /* Suhbatdosh meni bloklagan — xabar yoza olmayman, blokdan chiqarish tugmasi ko'rsatilmaydi
           (chunki bu boshqa odamning bloki, faqat u o'zi olib tashlay oladi) */
        <div style={{ padding: 16 }}>
          <div
            style={{
              border: `1px solid ${COLORS.line}`,
              borderRadius: 16,
              padding: 18,
              textAlign: "center",
              fontSize: 14.5,
              color: COLORS.inkSoft,
              lineHeight: 1.5,
            }}
          >
            Bu foydalanuvchiga xabar yubora olmaysiz
          </div>
        </div>
      ) : (
        <>
          {/* Tezkor javoblar - hali xabar yozilmagan bo'lsa ko'rsatiladi */}
          {!hasMessages && (
            <div
              style={{
                display: "flex",
                gap: 8,
                padding: "0 16px 10px",
                overflowX: "auto",
              }}
            >
              {QUICK_REPLIES.map((reply) => (
                <button
                  key={reply}
                  onClick={() => handleQuickReply(reply)}
                  disabled={sending}
                  style={{
                    flexShrink: 0,
                    background: "white",
                    border: `1px solid ${COLORS.line}`,
                    borderRadius: 999,
                    padding: "9px 14px",
                    fontSize: 13.5,
                    color: "#1A1A1A",
                    cursor: sending ? "not-allowed" : "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          {sendError && (
            <div style={{ color: "#C0392B", fontSize: 13, textAlign: "center", padding: "0 16px 6px" }}>{sendError}</div>
          )}

          {/* Input */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: 12,
              background: "white",
              borderTop: `1px solid ${COLORS.line}`,
            }}
          >
            <button
              onClick={handleAttachClick}
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: COLORS.cream,
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Paperclip size={18} color={COLORS.inkSoft} />
            </button>
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
              onChange={handleFileChange}
              style={{ display: "none" }}
            />

            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !sending) handleSend();
              }}
              placeholder="Xabar yozing..."
              style={{
                flex: 1,
                background: COLORS.cream,
                border: "none",
                borderRadius: 14,
                padding: "12px 16px",
                fontSize: 14.5,
                outline: "none",
                color: "#1A1A1A",
              }}
            />
            <button
              onClick={handleSend}
              disabled={sending || !text.trim()}
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: COLORS.forest,
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: sending || !text.trim() ? "not-allowed" : "pointer",
                opacity: sending || !text.trim() ? 0.6 : 1,
                flexShrink: 0,
              }}
            >
              <Send size={18} color="white" />
            </button>
          </div>
        </>
      )}

      {/* "..." bosilganda chiqadigan pastki varaq */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 200,
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
              background: "white",
              borderRadius: "20px 20px 0 0",
              padding: "8px 12px calc(env(safe-area-inset-bottom, 0px) + 16px)",
              boxSizing: "border-box",
            }}
          >
            <div style={{ width: 40, height: 4, background: COLORS.line, borderRadius: 999, margin: "6px auto 14px" }} />

            <button
              onClick={handleGoToProfile}
              style={{
                width: "100%",
                textAlign: "center",
                background: "none",
                border: "none",
                borderBottom: `1px solid ${COLORS.line}`,
                padding: "16px 12px",
                fontSize: 16,
                fontWeight: 600,
                color: COLORS.ink,
                cursor: "pointer",
              }}
            >
              Profilga o'tish
            </button>

            <button
              onClick={handleGoToSupport}
              style={{
                width: "100%",
                textAlign: "center",
                background: "none",
                border: "none",
                borderBottom: `1px solid ${COLORS.line}`,
                padding: "16px 12px",
                fontSize: 16,
                fontWeight: 600,
                color: COLORS.ink,
                cursor: "pointer",
              }}
            >
              Qo'llab-quvvatlash xizmati
            </button>

            {!isBlockedByMe && !isBlockedMe && (
              <button
                onClick={handleBlockUser}
                disabled={blocking}
                style={{
                  width: "100%",
                  textAlign: "center",
                  background: "none",
                  border: "none",
                  padding: "16px 12px",
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#C0392B",
                  cursor: blocking ? "not-allowed" : "pointer",
                }}
              >
                {blocking ? "Bloklanmoqda..." : "Foydalanuvchini bloklash"}
              </button>
            )}

            <button
              onClick={() => setMenuOpen(false)}
              style={{
                width: "100%",
                textAlign: "center",
                background: "none",
                border: "none",
                padding: "16px 12px",
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

      {/* Skrepka bosilganda chiqadigan pastki varaq */}
      {attachMenuOpen && (
        <div
          onClick={() => setAttachMenuOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 200,
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
              background: "white",
              borderRadius: "20px 20px 0 0",
              padding: "8px 12px calc(env(safe-area-inset-bottom, 0px) + 16px)",
              boxSizing: "border-box",
            }}
          >
            <div style={{ width: 40, height: 4, background: COLORS.line, borderRadius: 999, margin: "6px auto 14px" }} />

            <button
              onClick={handleOpenCamera}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                background: "none",
                border: "none",
                borderBottom: `1px solid ${COLORS.line}`,
                padding: "16px 12px",
                fontSize: 16,
                fontWeight: 600,
                color: COLORS.ink,
                cursor: "pointer",
              }}
            >
              <Camera size={19} color={COLORS.forest} />
              Kamera
            </button>

            <button
              onClick={handleOpenGallery}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                background: "none",
                border: "none",
                borderBottom: `1px solid ${COLORS.line}`,
                padding: "16px 12px",
                fontSize: 16,
                fontWeight: 600,
                color: COLORS.ink,
                cursor: "pointer",
              }}
            >
              <ImageIcon size={19} color={COLORS.forest} />
              Galereyadan tanlash
            </button>

            <button
              onClick={handleShareLocation}
              disabled={sharingLocation}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                background: "none",
                border: "none",
                padding: "16px 12px",
                fontSize: 16,
                fontWeight: 600,
                color: COLORS.ink,
                cursor: sharingLocation ? "not-allowed" : "pointer",
              }}
            >
              <MapPin size={19} color={COLORS.forest} />
              {sharingLocation ? "Aniqlanmoqda..." : "Geolokatsiyani ulashish"}
            </button>

            <button
              onClick={() => setAttachMenuOpen(false)}
              style={{
                width: "100%",
                textAlign: "center",
                background: "none",
                border: "none",
                padding: "16px 12px",
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

      {/* Bloklashni tasdiqlash oynasi */}
      {blockConfirmOpen && (
        <div
          onClick={() => !blocking && setBlockConfirmOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 250,
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
              background: "white",
              borderRadius: "20px 20px 0 0",
              padding: "24px 20px calc(env(safe-area-inset-bottom, 0px) + 20px)",
              boxSizing: "border-box",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.ink, marginBottom: 10 }}>
              Foydalanuvchini bloklash
            </div>
            <div style={{ fontSize: 14.5, color: COLORS.inkSoft, lineHeight: 1.5, marginBottom: 20 }}>
              Bloklangandan so'ng, bu foydalanuvchi sizga xabar yubora olmaydi va kontaktlaringizni ko'ra olmaydi. Uni istalgan vaqtda blokdan chiqarishingiz mumkin.
            </div>
            <button
              onClick={confirmBlockUser}
              disabled={blocking}
              style={{
                width: "100%",
                background: COLORS.pink,
                color: "white",
                border: "none",
                borderRadius: 14,
                padding: "15px 0",
                fontSize: 16,
                fontWeight: 700,
                cursor: blocking ? "not-allowed" : "pointer",
                opacity: blocking ? 0.7 : 1,
                marginBottom: 10,
              }}
            >
              {blocking ? "Bloklanmoqda..." : "Ha, bloklash"}
            </button>
            <button
              onClick={() => setBlockConfirmOpen(false)}
              disabled={blocking}
              style={{
                width: "100%",
                background: COLORS.cream,
                color: COLORS.ink,
                border: "none",
                borderRadius: 14,
                padding: "15px 0",
                fontSize: 16,
                fontWeight: 700,
                cursor: blocking ? "not-allowed" : "pointer",
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
