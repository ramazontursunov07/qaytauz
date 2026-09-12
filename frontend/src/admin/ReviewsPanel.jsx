import { useEffect, useState } from "react";
import { api } from "./api";

export default function ReviewsPanel() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get("/users/admin/reviews/");
        setReviews(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p>Yuklanmoqda...</p>;
  if (error) return <div className="admin-error">{error}</div>;

  return (
    <div>
      <h2>Sharhlar ({reviews.length})</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Sharh yozuvchi</th>
            <th>Sotuvchi</th>
            <th>Baho</th>
            <th>Izoh</th>
            <th>Sana</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.reviewer_username || r.reviewer?.username || r.reviewer}</td>
              <td>{r.seller_username || r.seller?.username || r.seller}</td>
              <td>{"★".repeat(r.rating)}</td>
              <td style={{ maxWidth: 280 }}>{r.comment || "-"}</td>
              <td>{new Date(r.created_at).toLocaleDateString("uz-UZ")}</td>
            </tr>
          ))}
          {reviews.length === 0 && (
            <tr>
              <td colSpan={6} style={{ textAlign: "center", padding: 20 }}>
                Sharhlar yo'q
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
