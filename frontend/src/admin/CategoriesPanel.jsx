import { useEffect, useState } from "react";
import { api } from "./api";

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export default function CategoriesPanel() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parent, setParent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editParent, setEditParent] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.get("/products/categories/");
      setCategories(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleNameChange = (val) => {
    setName(val);
    setSlug(slugify(val));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/products/category-create/", {
        name,
        slug,
        parent: parent || null,
      });
      setName("");
      setSlug("");
      setParent("");
      load();
    } catch (err) {
      alert("Xatolik: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteCategory = async (id, name) => {
    if (!window.confirm(`"${name}" kategoriyasini o'chirmoqchimisiz?`)) {
      return;
    }
    try {
      await api.del(`/products/category/${id}/`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert("Xatolik: " + err.message);
    }
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    setEditName(c.name);
    setEditSlug(c.slug);
    setEditParent(c.parent || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id) => {
    try {
      await api.patch(`/products/category/${id}/`, {
        name: editName,
        slug: editSlug,
        parent: editParent || null,
      });
      setEditingId(null);
      load();
    } catch (err) {
      alert("Xatolik: " + err.message);
    }
  };

  return (
    <div>
      <h2>Kategoriyalar ({categories.length})</h2>

      <form
        onSubmit={handleCreate}
        style={{ background: "white", padding: 16, borderRadius: 12, marginBottom: 20 }}
      >
        <div className="admin-form-row">
          <input
            className="admin-input"
            placeholder="Kategoriya nomi"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
          />
          <input
            className="admin-input"
            placeholder="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
          />
          <select
            className="admin-select"
            value={parent}
            onChange={(e) => setParent(e.target.value)}
          >
            <option value="">Ota kategoriya yo'q</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button className="admin-btn admin-btn-primary" disabled={submitting}>
            {submitting ? "Qo'shilmoqda..." : "Qo'shish"}
          </button>
        </div>
      </form>

      {loading && <p>Yuklanmoqda...</p>}
      {error && <div className="admin-error">{error}</div>}

      {!loading && !error && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nomi</th>
              <th>Slug</th>
              <th>Ota kategoriya</th>
              <th>Amal</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) =>
              editingId === c.id ? (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>
                    <input
                      className="admin-input"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      className="admin-input"
                      value={editSlug}
                      onChange={(e) => setEditSlug(e.target.value)}
                    />
                  </td>
                  <td>
                    <select
                      className="admin-select"
                      value={editParent}
                      onChange={(e) => setEditParent(e.target.value)}
                    >
                      <option value="">Ota kategoriya yo'q</option>
                      {categories
                        .filter((opt) => opt.id !== c.id)
                        .map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.name}
                          </option>
                        ))}
                    </select>
                  </td>
                  <td style={{ display: "flex", gap: 8 }}>
                    <button className="admin-btn admin-btn-primary" onClick={() => saveEdit(c.id)}>
                      Saqlash
                    </button>
                    <button className="admin-btn admin-btn-outline" onClick={cancelEdit}>
                      Bekor qilish
                    </button>
                  </td>
                </tr>
              ) : (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.name}</td>
                  <td>{c.slug}</td>
                  <td>{c.parent_name || c.parent || "-"}</td>
                  <td style={{ display: "flex", gap: 8 }}>
                    <button className="admin-btn admin-btn-outline" onClick={() => startEdit(c)}>
                      Tahrirlash
                    </button>
                    <button
                      className="admin-btn admin-btn-danger"
                      onClick={() => deleteCategory(c.id, c.name)}
                    >
                      O'chirish
                    </button>
                  </td>
                </tr>
              )
            )}
            {categories.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: 20 }}>
                  Kategoriyalar topilmadi
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}