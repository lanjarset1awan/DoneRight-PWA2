import React from "react";

export default function ReportStatsGrid({ cards, gridClass = "" }) {
  return (
    <div className={`admin-stats-grid ${gridClass}`}>
      {cards.map((card, idx) => (
        <div className="admin-stat-card" key={idx}>
          <div className="admin-stat-left">
            <span className="admin-stat-label">{card.label}</span>
            <span className="admin-stat-value">{card.value}</span>
            <span className="admin-stat-sub">{card.subLabel}</span>
          </div>
          <div className={`admin-stat-icon-circle ${card.iconClass}`}>
            {card.icon}
          </div>
        </div>
      ))}
    </div>
  );
}
