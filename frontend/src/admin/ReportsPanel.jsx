import { useEffect, useState } from "react";
import { api } from "./api";

export default function ReportsPanel() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.get("/users/admin/reports/");
      setReports(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resolve = async (id) => {
    try {
      await api.patch(`/users/admin/reports/${id}/`, { is_resolved: true });
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_resolved: true } : r))
      );
    } catch (err) {
      alert("Xatolik: " + err.message);
    }
  };

  if (loading) return <p>Yuklanmoqda...</p>;
  if (error) return <div className="admin-error">{error}</div>;

  return (
    <div>
      <h2>Shikoyatlar ({reports.length})</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Mahsulot</th>
            <th>Shikoyatchi</th>
            <th>Sabab</th>
            <th>Holati</th>
            <th>Amal</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.product_title || r.product?.title || r.product}</td>
              <td>{r.reporter_username || r.reporter?.username || r.reporter}</td>
              <td style={{ maxWidth: 280 }}>{r.reason}</td>
              <td>
                <span
                  className={
                    r.is_resolved
                      ? "admin-badge admin-badge-active"
                      : "admin-badge admin-badge-pending"
                  }
                >
                  {r.is_resolved ? "Ko'rib chiqilgan" : "Kutilmoqda"}
                </span>
              </td>
              <td>
                {!r.is_resolved && (
                  <button
                    className="admin-btn admin-btn-primary"
                    onClick={() => resolve(r.id)}
                  >
                    Hal qilindi
                  </button>
                )}
              </td>
            </tr>
          ))}
          {reports.length === 0 && (
            <tr>
              <td colSpan={6} style={{ textAlign: "center", padding: 20 }}>
                Shikoyatlar yo'q
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
