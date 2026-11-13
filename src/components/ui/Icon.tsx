/** Inline icon set — no icon package, so the bundle stays small and crisp. */
type IconName =
  | "search" | "bag" | "heart" | "user" | "menu" | "close" | "chevron-down" | "chevron-right"
  | "chevron-left" | "check" | "plus" | "minus" | "trash" | "truck" | "shield" | "refresh"
  | "phone" | "mail" | "pin" | "star" | "grid" | "shirt" | "dress" | "cap" | "gem" | "watch"
  | "phone-case" | "scissors" | "heart-hand" | "gift" | "plane" | "bottle" | "pen" | "home"
  | "sun" | "chart" | "box" | "tag" | "users" | "settings" | "logout" | "download" | "filter"
  | "facebook" | "instagram" | "youtube" | "tiktok" | "whatsapp" | "arrow-right" | "alert"
  | "flame" | "lightning" | "chevron-up" | "location" | "cart-plus" | "sort" | "sliders"
  | "badge-check" | "cash" | "clock" | "ruler";

const paths: Record<string, string> = {
  search: "M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z",
  flame: "M12 3c2.5 3 1 4.5 1 4.5s2.5-.5 3.5 1.5c1.2 2.4-.5 4-2 4.5 1.5-2-.5-3.5-.5-3.5S13 12 12 14s-2 3-4 2.5C5 16 5 12 6.5 10c1-1.3 3-1.5 3-1.5S8 6.5 12 3z",
  lightning: "M13 2L4 14h6l-1 8 9-12h-6l1-8z",
  "chevron-up": "M6 15l6-6 6 6",
  location: "M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11zm0-8.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z",
  "cart-plus": "M4 5h2l2.5 10h9L20 8H7M9 20a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z",
  sort: "M4 7h10M4 12h7M4 17h4M17 5v14m0 0l3-3m-3 3l-3-3",
  sliders: "M4 7h9M17 7h3M4 17h3M11 17h9M15 5v4M8 15v4",
  "badge-check": "M12 3l2.2 1.6 2.7-.2 1 2.5 2.3 1.4-.7 2.6.7 2.6-2.3 1.4-1 2.5-2.7-.2L12 21l-2.2-1.6-2.7.2-1-2.5L3.8 15l.7-2.6-.7-2.6 2.3-1.4 1-2.5 2.7.2L12 3zm-2.5 9l2 2 4-4",
  cash: "M3 6h18v12H3V6zm9 9a3 3 0 100-6 3 3 0 000 6z",
  clock: "M12 21a9 9 0 100-18 9 9 0 000 18zm0-13v5l3.5 2",
  ruler: "M3 9l6-6 12 12-6 6L3 9zm4 0l2 2m1-5l2 2m1-1l2 2m1 1l2 2",
  bag: "M6 8h12l1 12H5L6 8zm3 0V6a3 3 0 016 0v2",
  heart: "M12 20s-7-4.35-7-9a4 4 0 017-2.65A4 4 0 0119 11c0 4.65-7 9-7 9z",
  user: "M12 12a4 4 0 100-8 4 4 0 000 8zm-8 8a8 8 0 0116 0",
  menu: "M4 7h16M4 12h16M4 17h16",
  close: "M6 6l12 12M18 6L6 18",
  "chevron-down": "M6 9l6 6 6-6",
  "chevron-right": "M9 6l6 6-6 6",
  "chevron-left": "M15 6l-6 6 6 6",
  check: "M5 12.5l4.5 4.5L19 7",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  trash: "M4 7h16M9 7V5h6v2m-8 0l1 13h8l1-13",
  truck: "M3 16V6h11v10M14 10h4l3 3v3h-7M6.5 19a1.5 1.5 0 103 0 1.5 1.5 0 00-3 0zm10 0a1.5 1.5 0 103 0 1.5 1.5 0 00-3 0z",
  shield: "M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z",
  refresh: "M20 11a8 8 0 10-2.5 5.7M20 5v6h-6",
  phone: "M6 3h4l2 5-3 2a11 11 0 005 5l2-3 5 2v4a2 2 0 01-2 2A17 17 0 014 5a2 2 0 012-2z",
  mail: "M3 6h18v12H3V6zm0 0l9 7 9-7",
  pin: "M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11zm0-8.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z",
  star: "M12 4l2.4 5 5.6.8-4 4 1 5.6-5-2.7-5 2.7 1-5.6-4-4 5.6-.8L12 4z",
  grid: "M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z",
  shirt: "M8 4l4 2 4-2 4 4-3 3v8H7v-8L4 8l4-4z",
  dress: "M9 3h6l-1 5 4 13H6L10 8 9 3z",
  cap: "M4 15a8 8 0 0116 0H4zm16 0h2a2 2 0 01-2 2h-2",
  gem: "M6 4h12l3 5-9 11L3 9l3-5zm0 5h12M9 4l-1 5 4 11 4-11-1-5",
  watch: "M9 3h6v4a4 4 0 010 10v4H9v-4a4 4 0 010-10V3zm3 5v4l3 2",
  "phone-case": "M8 2h8a1 1 0 011 1v18a1 1 0 01-1 1H8a1 1 0 01-1-1V3a1 1 0 011-1zm2 3v2h4V5",
  scissors: "M6 4l12 14M18 4L6 18M8 20a2 2 0 100-4 2 2 0 000 4zm8 0a2 2 0 100-4 2 2 0 000 4z",
  "heart-hand": "M12 20s-7-4.35-7-9a4 4 0 017-2.65A4 4 0 0119 11c0 4.65-7 9-7 9zM9 11h6",
  gift: "M3 9h18v3H3V9zm1 3h16v9H4v-9zm7-3V6a2 2 0 10-2 2h2zm0 0h2a2 2 0 10-2-2v2z",
  plane: "M2 13l20-8-8 20-3-8-9-4z",
  bottle: "M10 2h4v3l2 3v13H8V8l2-3V2zM8 12h8",
  pen: "M4 20l1-5L16 4l4 4L9 19l-5 1zm11-15l4 4",
  home: "M3 11l9-7 9 7v9H3v-9zm6 9v-6h6v6",
  sun: "M12 4v2m0 12v2M4 12h2m12 0h2M6.3 6.3l1.4 1.4m8.6 8.6l1.4 1.4m0-11.4l-1.4 1.4M7.7 16.3l-1.4 1.4M16 12a4 4 0 11-8 0 4 4 0 018 0z",
  chart: "M4 20V10m6 10V4m6 16v-7m6 7V8",
  box: "M3 8l9-5 9 5v8l-9 5-9-5V8zm0 0l9 5 9-5M12 13v8",
  tag: "M4 4h8l8 8-8 8-8-8V4zm4 4h.01",
  users: "M9 11a3 3 0 100-6 3 3 0 000 6zm-6 9a6 6 0 0112 0m2-13a3 3 0 010 6m2 7a5 5 0 00-3-4.6",
  settings: "M12 15a3 3 0 100-6 3 3 0 000 6zm8-3l2 1-2 4-2-.5-2 1.5-1.5 1.5L13 22h-2l-.5-2.5L9 18l-2 .5-2-4 2-1v-2l-2-1 2-4 2 .5L10.5 6 12 4.5 12.5 2h2l.5 2.5L17 6l2-.5 2 4-2 1v2z",
  logout: "M9 4H5v16h4m4-12l4 4-4 4m-4-4h10",
  download: "M12 3v12m-5-5l5 5 5-5M4 19h16",
  filter: "M3 6h18M7 12h10M10 18h4",
  facebook: "M14 9V7a1 1 0 011-1h2V3h-3a4 4 0 00-4 4v2H8v3h2v9h4v-9h2.5l.5-3H14z",
  instagram: "M7 3h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7a4 4 0 014-4zm5 5.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zM17 6.5h.01",
  youtube: "M3 8a3 3 0 013-3h12a3 3 0 013 3v8a3 3 0 01-3 3H6a3 3 0 01-3-3V8zm7 1.5v5l5-2.5-5-2.5z",
  tiktok: "M14 3v9.5a3.5 3.5 0 11-3.5-3.5M14 3c.4 2.2 2 3.8 4.5 4",
  whatsapp: "M4 20l1.2-3.6A8 8 0 1112 20a8 8 0 01-4-1L4 20zm5-8.5c.6 2 2.5 3.4 4.3 3.7l1.2-1.4 1.8.8-.4 1.6c-2.6.4-5.6-1.2-6.9-3.7-.4-.8-.6-1.6-.6-2l1.6-.4.8 1.8-1.4 1.2",
  "arrow-right": "M4 12h16m-6-6l6 6-6 6",
  alert: "M12 3l9 17H3L12 3zm0 5v6m0 3h.01",
};

export function Icon({
  name,
  size = 20,
  className = "",
  strokeWidth = 1.5,
}: {
  name: IconName | string;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  const d = paths[name] ?? paths.grid;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      focusable="false"
    >
      <path d={d} />
    </svg>
  );
}
