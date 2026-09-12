import { useEffect, useState } from "react";
import { api } from "./api";

function formatLabel(key) {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function StatsPanel() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get("/users/admin/stats/");
        // Ba'zi API'lar ro'yxat (list) qaytaradi, ba'zilari bitta obyekt.
        const obj = Array.isArray(data) ? data[0] : data;
        setStats(obj || {});
      } catch (err) {
        setError(err.message);
      }
    })();
  }, []);

  if (error) return <div className="admin-error">{error}</div>;
  if (!stats) return <p>Yuklanmoqda...</p>;

  return (
    <div>
      <h2>Statistika</h2>
      <div className="admin-card-grid">
        {Object.entries(stats).map(([key, value]) => (
          <div className="admin-stat-card" key={key}>
            <div className="value">
              {typeof value === "number" ? value.toLocaleString("uz-UZ") : String(value)}
            </div>
            <div className="label">{formatLabel(key)}</div>
          </div>
        ))}
        {Object.keys(stats).length === 0 && <p>Statistika ma'lumoti topilmadi</p>}
      </div>
    </div>
  );
}
