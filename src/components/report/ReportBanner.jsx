import React from "react";

export default function ReportBanner({
  label,
  value,
  percent,
  cardClass = "",
  labelClass = "",
  valueClass = "",
  containerClass = "",
  fillClass = "",
}) {
  return (
    <div className={`big-productivity-card ${cardClass}`}>
      <div className={`big-prod-label ${labelClass}`}>{label}</div>
      <div className={`big-prod-value ${valueClass}`}>{value}%</div>
      <div className={`progress-bar-container ${containerClass}`}>
        <div className={`progress-bar-fill ${fillClass}`} style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
}
