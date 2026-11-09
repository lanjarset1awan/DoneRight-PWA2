import React from "react";

export default function ReportActions({
  title,
  description,
  onDownload,
  downloading,
  downloadingText = "Mengunduh PDF...",
  buttonText = "Unduh Laporan PDF",
  cardClass = "",
  titleClass = "",
  descClass = "",
  btnClass = "",
}) {
  return (
    <div className={`report-action-card ${cardClass}`}>
      <h3 className={`report-action-title ${titleClass}`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--primary-color)" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {title}
      </h3>
      <p className={`report-action-desc ${descClass}`}>
        {description}
      </p>
      <button
        className={`btn-primary ${btnClass}`}
        onClick={onDownload}
        disabled={downloading}
      >
        {downloading ? (
          downloadingText
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {buttonText}
          </>
        )}
      </button>
    </div>
  );
}
