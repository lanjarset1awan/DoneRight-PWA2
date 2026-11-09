import { jsPDF } from "jspdf";

/**
 * Generates and downloads a clean, beautifully formatted A4 PDF from report text.
 * Fits the printable width of A4 with large, readable font and balanced left-right margins.
 *
 * @param {string} filename - The name of the downloaded file (e.g. "Laporan_Produktivitas.pdf")
 * @param {string} textContent - The raw formatted text content of the report
 */
export function downloadTextAsPDF(filename, textContent) {
  const finalFilename = filename.toLowerCase().endsWith(".pdf") ? filename : `${filename}.pdf`;

  // Standard A4: 210mm x 297mm
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210 mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297 mm
  const maxPrintableWidth = 176; // Target width to give ~17mm margins on both sides

  const rawLines = (textContent || "").trim().split("\n");

  // Determine optimal font size: start from 13.5pt and scale down only if lines exceed printable width
  let fontSize = 13.5;
  doc.setFont("courier", "normal");
  doc.setFontSize(fontSize);
  doc.setTextColor(15, 23, 42); // Uniform slate-900 contrast

  let maxContentWidth = Math.max(...rawLines.map((line) => doc.getTextWidth(line || "")));
  while (maxContentWidth > maxPrintableWidth && fontSize > 8.5) {
    fontSize -= 0.5;
    doc.setFontSize(fontSize);
    maxContentWidth = Math.max(...rawLines.map((line) => doc.getTextWidth(line || "")));
  }

  // Calculate symmetrical left and right margins
  const marginX = Math.max(14, (pageWidth - maxContentWidth) / 2);
  const marginTop = 26;
  const marginBottom = 20;
  const lineHeight = fontSize * 0.54; // Comfortable proportional line height (~7.3mm at 13.5pt)

  let y = marginTop;

  for (let i = 0; i < rawLines.length; i++) {
    const rawLine = rawLines[i];

    // Handle empty spacing line
    if (!rawLine || rawLine.trim() === "") {
      y += lineHeight * 0.7;
      continue;
    }

    // Keep all lines uniformly normal (no bold)
    doc.setFont("courier", "normal");
    doc.setTextColor(15, 23, 42);

    // Wrap line if it somehow exceeds the printable boundary
    const wrappedLines = doc.splitTextToSize(rawLine, pageWidth - marginX * 2);

    for (let j = 0; j < wrappedLines.length; j++) {
      if (y + lineHeight > pageHeight - marginBottom) {
        doc.addPage();
        doc.setFont("courier", "normal");
        doc.setTextColor(15, 23, 42);
        y = marginTop;
      }
      doc.text(wrappedLines[j], marginX, y);
      y += lineHeight;
    }
  }

  doc.save(finalFilename);
  return true;
}
