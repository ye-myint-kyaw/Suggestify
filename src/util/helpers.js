const relativeTime = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const UNITS = [
  ["year", 60 * 60 * 24 * 365],
  ["month", 60 * 60 * 24 * 30],
  ["week", 60 * 60 * 24 * 7],
  ["day", 60 * 60 * 24],
  ["hour", 60 * 60],
  ["minute", 60],
];

// "just now", "5 minutes ago", "yesterday", "3 weeks ago" ...
export const timeAgo = (timestamp, now = Date.now()) => {
  const seconds = Math.round((timestamp - now) / 1000);
  for (const [unit, unitSeconds] of UNITS) {
    if (Math.abs(seconds) >= unitSeconds) {
      return relativeTime.format(Math.round(seconds / unitSeconds), unit);
    }
  }
  return "just now";
};

export const formatDate = (timestamp) =>
  new Date(timestamp).toLocaleString("en", {
    dateStyle: "medium",
    timeStyle: "short",
  });

// Safe file name from a box name: "How was my talk?" -> "how-was-my-talk"
export const slugify = (text) =>
  text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "suggestify";

export const downloadBlob = (blob, fileName) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
