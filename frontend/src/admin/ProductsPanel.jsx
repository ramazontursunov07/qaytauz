import { useEffect, useState } from "react";
import { api } from "./api";

const STATUS_OPTIONS = ["Faol", "Sotildi", "Ko‘rib chiqilmoqda", "Bloklangan"];

function statusBadgeClass(status) {
  if (status === "Faol") return "admin-badge admin-badge-active";
  if (status === "Sotildi") return "admin-badge admin-badge-sold";
  if (status === "Bloklangan") return "admin-badge admin-badge-blocked";
  return "admin-badge admin-badge-pending";
}

export default function ProductsPanel() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.get("/products/admin/all/");
      setProducts(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const changeStatus = async (id, newStatus) => {
    try {
      await api.patch(`/products/admin/${id}/`, { status: newStatus });
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
      );
    } catch (err) {
      alert("Xatolik: " + err.message);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Bu e'lonni butunlay o'chirmoqchimisiz?")) return;
    try {
      await api.del(`/products/admin/${id}/`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert("Xatolik: " + err.message);
    }
  };

  if (loading) return <p>Yuklanmoqda...</p>;
  if (error) return <div className="admin-error">{error}</div>;

  return (
    <div>
      <h2>Mahsulotlar ({products.length})</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Nomi</th>
            <th>Narx</th>
            <th>Egasi</th>
            <th>Holati</th>
            <th>Kategoriya</th>
            <th>Amallar</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.title}</td>
              <td>{Number(p.price).toLocaleString("uz-UZ")} so'm</td>
              <td>{p.owner_username || p.owner?.username || p.owner}</td>
              <td>
                <span className={statusBadgeClass(p.status)}>{p.status}</span>
              </td>
              <td>{p.category_name || p.category?.name || p.category || "-"}</td>
              <td style={{ display: "flex", gap: 6 }}>
                <select
                  className="admin-select"
                  value={p.status}
                  onChange={(e) => changeStatus(p.id, e.target.value)}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button
                  className="admin-btn admin-btn-danger"
                  onClick={() => deleteProduct(p.id)}
                >
                  O'chirish
                </button>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan={7} style={{ textAlign: "center", padding: 20 }}>
                Mahsulotlar topilmadi
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
