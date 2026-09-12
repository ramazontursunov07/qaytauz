import { useState } from "react";
import { getToken, clearToken } from "./api";
import Login from "./Login";
import ProductsPanel from "./ProductsPanel";
import CategoriesPanel from "./CategoriesPanel";
import UsersPanel from "./UsersPanel";
import ReportsPanel from "./ReportsPanel";
import ReviewsPanel from "./ReviewsPanel";
import StatsPanel from "./StatsPanel";
import "./AdminPanel.css";

const TABS = [
  { key: "stats", label: "Statistika", component: StatsPanel },
  { key: "products", label: "Mahsulotlar", component: ProductsPanel },
  { key: "categories", label: "Kategoriyalar", component: CategoriesPanel },
  { key: "users", label: "Foydalanuvchilar", component: UsersPanel },
  { key: "reports", label: "Shikoyatlar", component: ReportsPanel },
  { key: "reviews", label: "Sharhlar", component: ReviewsPanel },
];

export default function AdminApp() {
  const [authed, setAuthed] = useState(!!getToken());
  const [activeTab, setActiveTab] = useState("stats");

  if (!authed) {
    return <Login onSuccess={() => setAuthed(true)} />;
  }

  const ActiveComponent = TABS.find((t) => t.key === activeTab)?.component || StatsPanel;

  const handleLogout = () => {
    clearToken();
    setAuthed(false);
  };

  return (
    <div className="admin-shell">
      <div className="admin-sidebar">
        <h1>
          Qayta<span>Uz</span>
        </h1>
        {TABS.map((tab) => (
          <div
            key={tab.key}
            className={`admin-nav-item ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </div>
        ))}
        <div className="admin-logout" onClick={handleLogout}>
          Chiqish
        </div>
      </div>
      <div className="admin-content">
        <ActiveComponent />
      </div>
    </div>
  );
}
