import { useEffect, useState } from "react";
import { api } from "./api";

export default function UsersPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.get("/users/admin/users/");
      setUsers(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleField = async (id, field, currentValue) => {
    try {
      await api.patch(`/users/admin/users/${id}/`, { [field]: !currentValue });
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, [field]: !currentValue } : u))
      );
    } catch (err) {
      alert("Xatolik: " + err.message);
    }
  };

  const deleteUser = async (id, username) => {
    if (!window.confirm(`"${username}" foydalanuvchisini butunlay o'chirmoqchimisiz?`)) {
      return;
    }
    try {
      await api.del(`/users/admin/users/${id}/`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      alert("Xatolik: " + err.message);
    }
  };

  if (loading) return <p>Yuklanmoqda...</p>;
  if (error) return <div className="admin-error">{error}</div>;

  return (
    <div>
      <h2>Foydalanuvchilar ({users.length})</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Username</th>
            <th>Email</th>
            <th>Telefon</th>
            <th>Region</th>
            <th>Faol</th>
            <th>Admin (staff)</th>
            <th>Amal</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.username}</td>
              <td>{u.email}</td>
              <td>{u.phone_number || "-"}</td>
              <td>{u.region || "-"}</td>
              <td>
                <button
                  className={`admin-btn ${u.is_active ? "admin-btn-primary" : "admin-btn-outline"}`}
                  onClick={() => toggleField(u.id, "is_active", u.is_active)}
                >
                  {u.is_active ? "Faol" : "Bloklangan"}
                </button>
              </td>
              <td>
                <button
                  className={`admin-btn ${u.is_staff ? "admin-btn-primary" : "admin-btn-outline"}`}
                  onClick={() => toggleField(u.id, "is_staff", u.is_staff)}
                >
                  {u.is_staff ? "Ha" : "Yo'q"}
                </button>
              </td>
              <td>
                <button
                  className="admin-btn admin-btn-danger"
                  onClick={() => deleteUser(u.id, u.username)}
                >
                  O'chirish
                </button>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={8} style={{ textAlign: "center", padding: 20 }}>
                Foydalanuvchilar topilmadi
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}