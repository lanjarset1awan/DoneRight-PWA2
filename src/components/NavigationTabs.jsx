import React from "react";
import { CheckSquare, BarChart2, Trash2 } from "lucide-react";
import "../styles/components/nav-tabs.css";

export default function NavigationTabs({ activeTab, onNavigate }) {
  const tabs = [
    {
      id: "dashboard",
      label: "Daftar Tugas",
      shortLabel: "Tugas",
      icon: <CheckSquare size={16} />,
    },
    {
      id: "report",
      label: "Laporan Produktivitas",
      shortLabel: "Laporan",
      icon: <BarChart2 size={16} />,
    },
    {
      id: "trash",
      label: "Keranjang Sampah",
      shortLabel: "Sampah",
      icon: <Trash2 size={16} />,
    },
  ];

  return (
    <div className="nav-tabs-card">
      <div className="nav-tabs-slider">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`nav-tab-item ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => onNavigate && onNavigate(tab.id)}
          >
            <span className="nav-tab-icon">{tab.icon}</span>
            <span className="nav-tab-label-full">{tab.label}</span>
            <span className="nav-tab-label-short">{tab.shortLabel}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

