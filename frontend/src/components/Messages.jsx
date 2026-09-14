import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pin, ShieldCheck, User, MoreVertical } from "lucide-react";
import BottomNav from "./BottomNav";
import { API_URL } from "../config";

const COLORS = {
  forest: "#2F6B4F",
  inkSoft: "#5B6459",
  line: "#E1DACB",
  cream: "#FAF6EE",
};

const API_BASE = API_URL;

function authHeaders() {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function resolveImageUrl(url) {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
}

function formatChatDate(isoDate) {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}.${d.getFullYear()}`;
}

export default function Xabarlar() {
  const navigate = useNavigate();
  const [myId, setMyId] = useState(null);
  const [chats, setChats] = useState([]);
  const [otherUsers, setOtherUsers] = useState({}); // { [userId]: {username, avatar} }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuChatId, setMenuChatId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${API_BASE}/api/users/profile/`, { headers: authHeaders() })
      .then((res) => (res.ok ? res.json() : null))
      .then((me) => {
        if (!me) throw new Error("Profil ma'lumotini olib bo'lmadi");
        setMyId(me.id);
        return fetch(`${API_BASE}/api/chats/chat-list/`, { headers: authHeaders() });
      })
      .then((res) => {
        if (!res.ok) throw new Error("Suhbatlarni yuklab bo'lmadi");
        return res.json();
      })
      .then((data) => {
        const chatList = Array.isArray(data) ? data : data.results || [];
        setChats(chatList);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // myId aniqlanganidan keyin, har bir chat uchun suhbatdosh profilini yuklaymiz
  useEffect(() => {
    if (myId === null || chats.length === 0) return;
    const idsToFetch = new Set();
    chats.forEach((chat) => {
      const otherId = (chat.participants || []).find((p) => p !== myId);
      if (otherId && !otherUsers[otherId]) idsToFetch.add(otherId);
    });
    if (idsToFetch.size === 0) return;

    Promise.all(
      Array.from(idsToFetch).map((id) =>
        fetch(`${API_BASE}/api/users/public/${id}/`).then((res) => (res.ok ? res.json() : null))
      )
    ).then((results) => {
      setOtherUsers((prev) => {
        const next = { ...prev };
        results.forEach((u) => {
          if (u) next[u.id] = u;
        });
        return next;
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myId, chats]);

  const handleDeleteChat = (chatId) => {
    setDeletingId(chatId);
    fetch(`${API_BASE}/api/chats/chat-detail/${chatId}/`, {
      method: "DELETE",
      headers: authHeaders(),
    })
      .then((res) => {
        if (!res.ok && res.status !== 204) throw new Error("O'chirib bo'lmadi");
        setChats((prev) => prev.filter((c) => c.id !== chatId));
      })
      .catch(() => {
        alert("Suhbatni o'chirib bo'lmadi, qaytadan urinib ko'ring.");
      })
      .finally(() => {
        setDeletingId(null);
        setMenuChatId(null);
      });
  };

  return (
    <div style={{ background: COLORS.cream, minHeight: "100vh", paddingBottom: 100 }}>
      <h1
        style={{
          textAlign: "center",
          fontSize: 20,
          fontWeight: 700,
          padding: "20px 16px 16px",
          margin: 0,
          color: "#1A1A1A",
        }}
      >
        Xabarlar
      </h1>

      {/* Pinned system notification */}
      <div
        style={{
          background: "white",
          margin: "0 16px 12px",
          borderRadius: 16,
          padding: 16,
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: COLORS.forest,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: 700,
            fontSize: 14,
            flexShrink: 0,
          }}
        >
          QU
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>QaytaUz</span>
            <Pin size={13} color={COLORS.inkSoft} />
            <span style={{ marginLeft: "auto", fontSize: 12, color: COLORS.inkSoft }}>
              25 avgust
            </span>
          </div>
          <div style={{ fontSize: 14, color: "#1A1A1A", lineHeight: 1.4 }}>
            Yoqtirgan e'lonlaringizni yo'qotib qo'ymang
          </div>
        </div>
      </div>

      {/* Safety promo card */}
      <div
        style={{
          background: "white",
          margin: "0 16px 20px",
          borderRadius: 16,
          padding: "32px 24px",
          textAlign: "center",
        }}
      >
        <ShieldCheck size={56} color={COLORS.forest} style={{ marginBottom: 16 }} />
        <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>
          QaytaUz chatlarida xavfsizroq
        </div>
        <div style={{ fontSize: 14, color: COLORS.inkSoft, lineHeight: 1.5 }}>
          QaytaUz chatlarida muloqot qilish
          <br />
          qulayroq va xavfsizroq
        </div>
      </div>

      {/* Chat list / empty state */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 24px", color: COLORS.inkSoft }}>
          Yuklanmoqda...
        </div>
      ) : error ? (
        <div style={{ textAlign: "center", padding: "40px 24px", color: "#C0392B" }}>
          Xatolik: {error}
        </div>
      ) : chats.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 24px", color: COLORS.inkSoft }}>
          Hozircha xabarlaringiz yo'q
        </div>
      ) : (
        <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          {chats.map((chat) => {
            const otherId = (chat.participants || []).find((p) => p !== myId);
            const other = otherUsers[otherId];
            return (
              <div
                key={chat.id}
                style={{
                  background: "white",
                  borderRadius: 16,
                  padding: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  onClick={() => navigate(`/xabarlar/${chat.id}`)}
                  style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0, cursor: "pointer" }}
                >
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: "50%",
                      background: "#EDEDED",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                  >
                    {other?.avatar ? (
                      <img
                        src={resolveImageUrl(other.avatar)}
                        alt=""
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <User size={22} color={COLORS.inkSoft} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                      <span style={{ fontWeight: 700, fontSize: 15, color: "#1A1A1A" }}>
                        {other?.username || "Foydalanuvchi"}
                      </span>
                      {chat.last_message?.created_at && (
                        <span style={{ fontSize: 12, color: COLORS.inkSoft, flexShrink: 0, marginLeft: 8 }}>
                          {formatChatDate(chat.last_message.created_at)}
                        </span>
                      )}
                    </div>
                    {chat.product_title && (
                      <div
                        style={{
                          fontSize: 12.5,
                          color: COLORS.forest,
                          fontWeight: 600,
                          marginBottom: 2,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {chat.product_title}
                      </div>
                    )}
                    <div
                      style={{
                        fontSize: 13.5,
                        color: COLORS.inkSoft,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {chat.last_message?.text || "Hozircha xabar yo'q"}
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuChatId(chat.id);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 6,
                    flexShrink: 0,
                    color: COLORS.inkSoft,
                  }}
                >
                  <MoreVertical size={20} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Chat menyusi: o'chirish / bekor qilish */}
      {menuChatId && (
        <div
          onClick={() => setMenuChatId(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
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
              maxWidth: 420,
              background: "white",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: "8px 12px calc(env(safe-area-inset-bottom, 0px) + 16px)",
              boxSizing: "border-box",
            }}
          >
            <div style={{ width: 40, height: 4, background: COLORS.line, borderRadius: 999, margin: "10px auto 14px" }} />
            <button
              onClick={() => handleDeleteChat(menuChatId)}
              disabled={deletingId === menuChatId}
              style={{
                width: "100%",
                background: "none",
                border: "none",
                borderBottom: `1px solid ${COLORS.line}`,
                padding: "16px 12px",
                fontSize: 16,
                fontWeight: 600,
                color: "#C0392B",
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              {deletingId === menuChatId ? "O'chirilmoqda..." : "Suhbatni o'chirish"}
            </button>
            <button
              onClick={() => setMenuChatId(null)}
              style={{
                width: "100%",
                background: "none",
                border: "none",
                padding: "16px 12px",
                fontSize: 16,
                fontWeight: 700,
                color: COLORS.inkSoft,
                cursor: "pointer",
                textAlign: "center",
                marginTop: 4,
              }}
            >
              Bekor qilish
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
