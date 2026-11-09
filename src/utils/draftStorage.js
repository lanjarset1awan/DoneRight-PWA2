// ---------------------------------------------------------------------------
// draftStorage.js — Auto-save / restore task form drafts via localStorage.
// Keyed by a string id:
//   'create'  → Task creation draft
//   '<id>'    → Task edit draft
// ---------------------------------------------------------------------------

const PREFIX = "doneright_task_draft_";
const TS_SUFFIX = "_ts";

export const saveDraft = (draftData, draftId = "create") => {
  try {
    const key = `${PREFIX}${draftId}`;
    const ts = new Date().toISOString();
    localStorage.setItem(key, JSON.stringify({ ...draftData, savedAt: ts }));
    localStorage.setItem(`${key}${TS_SUFFIX}`, ts);
    return true;
  } catch {
    return false;
  }
};

export const loadDraft = (draftId = "create") => {
  try {
    const raw = localStorage.getItem(`${PREFIX}${draftId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const deleteDraft = (draftId = "create") => {
  try {
    const key = `${PREFIX}${draftId}`;
    localStorage.removeItem(key);
    localStorage.removeItem(`${key}${TS_SUFFIX}`);
    return true;
  } catch {
    return false;
  }
};

export const hasDraft = (draftId = "create") => {
  try {
    return localStorage.getItem(`${PREFIX}${draftId}`) !== null;
  } catch {
    return false;
  }
};

export const getDraftTimestamp = (draftId = "create") => {
  try {
    return localStorage.getItem(`${PREFIX}${draftId}${TS_SUFFIX}`);
  } catch {
    return null;
  }
};

export const formatDraftTime = (timestamp) => {
  if (!timestamp) return "";
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} jam lalu`;
  const days = Math.floor(hrs / 24);
  return `${days} hari lalu`;
};
