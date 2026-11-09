// ---------------------------------------------------------------------------
// helpers.js — pure utility functions for DoneRight PWA 2
// ---------------------------------------------------------------------------

/**
 * Format deadline date to Indonesian locale readable string.
 */
export const formatDeadline = (dateStr) => {
  if (!dateStr) return "-";
  try {
    const formattedStr = typeof dateStr === "string" ? dateStr.replace(" ", "T") : dateStr;
    const date = new Date(formattedStr);
    if (isNaN(date.getTime())) return String(dateStr);
    return date.toLocaleDateString("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(dateStr);
  }
};

/**
 * Client-side search match.
 */
export const matchesSearch = (item, query) => {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    (item.title || "").toLowerCase().includes(q) ||
    (item.description || "").toLowerCase().includes(q) ||
    (item.category_name || "").toLowerCase().includes(q)
  );
};

/**
 * Priority badge label translation.
 */
export const getPriorityLabel = (priority) => {
  switch (priority) {
    case "high":
      return "Tinggi";
    case "medium":
      return "Sedang";
    case "low":
      return "Rendah";
    default:
      return priority || "Normal";
  }
};
