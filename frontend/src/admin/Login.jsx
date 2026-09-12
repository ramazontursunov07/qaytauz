import { useState } from "react";
import { loginAdmin } from "./api";

export default function Login({ onSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginAdmin(username, password);
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrap">
      <form className="admin-login-box" onSubmit={handleSubmit}>
        <h2>
          Qayta<span style={{ color: "#C1652F" }}>Uz</span> Admin
        </h2>
        {error && <div className="admin-error">{error}</div>}
        <div className="admin-form-row" style={{ flexDirection: "column" }}>
          <input
            className="admin-input"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            className="admin-input"
            type="password"
            placeholder="Parol"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          className="admin-btn admin-btn-primary"
          style={{ width: "100%", padding: "10px 0" }}
          disabled={loading}
        >
          {loading ? "Kirilmoqda..." : "Kirish"}
        </button>
      </form>
    </div>
  );
}
