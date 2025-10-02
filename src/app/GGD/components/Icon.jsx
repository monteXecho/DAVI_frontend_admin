export default function Icon({ name, size = 16, className = "", ...props }) {
  const icons = {
    check: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M16.46 7.455a1.125 1.125 0 0 1 1.605 1.575l-5.985 7.485a1.125 1.125 0 0 1-1.62.03L6.486 12.576a1.125 1.125 0 1 1 1.59-1.59l3.14 3.14 5.244-6.67z" />
      </svg>
    ),
    edit: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
    play: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="5,3 19,12 5,21" />
      </svg>
    ),
    "loader-2": (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12a9 9 0 11-6.219-8.56" />
      </svg>
    ),
    "refresh-cw": (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="23,4 23,10 17,10" />
        <polyline points="1,20 1,14 7,14" />
        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
      </svg>
    ),
    eye: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    download: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7,10 12,15 17,10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
    info: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
      </svg>
    ),
    "trash-2": (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="3,6 5,6 21,6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
      </svg>
    ),
    x: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
    save: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
        <polyline points="17,21 17,13 7,13 7,21" />
        <polyline points="7,3 7,8 15,8" />
      </svg>
    ),
    cloudUpload: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Cloud shape */}
        <path d="M17.5 18.5H6.5A4.5 4.5 0 0 1 7 9.1 6.5 6.5 0 0 1 19 10.5a4 4 0 0 1-1.5 7.5z" />
        {/* Upload arrow */}
        <path d="M12 12v6" />
        <path d="M9 15l3-3 3 3" />
      </svg>
    ),
    cloudDownload: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Cloud shape */}
        <path d="M17.5 18.5H6.5A4.5 4.5 0 0 1 7 9.1 6.5 6.5 0 0 1 19 10.5a4 4 0 0 1-1.5 7.5z" />
        {/* Download arrow */}
        <path d="M12 12v6" />
        <path d="M9 15l3 3 3-3" />
      </svg>
    ),
    greenRoundCheck: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M9.998 0C15.515 0 19.995 4.48 19.995 9.997C19.995 15.515 15.515 19.995 9.998 19.995C4.48 19.995 0 15.515 0 9.997C0 4.48 4.48 0 9.998 0ZM4.949 10.386L8.8 13.816C8.942 13.944 9.121 14.006 9.299 14.006C9.501 14.006 9.704 13.925 9.851 13.764L15.804 7.255C15.935 7.112 16 6.932 16 6.753C16 6.343 15.669 6.006 15.252 6.006C15.048 6.006 14.847 6.088 14.698 6.249L9.245 12.211L5.947 9.273C5.803 9.146 5.626 9.083 5.448 9.083C5.033 9.083 4.7 9.418 4.7 9.829C4.7 10.034 4.784 10.238 4.949 10.386Z"
          fill="#23BD92"
        />
      </svg>
    ),
    redRoundWarning: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M9.997 19.995C15.515 19.995 19.995 15.515 19.995 9.997C19.995 4.479 15.515 0 9.997 0C4.48 0 0 4.479 0 9.997C0 15.515 4.48 19.995 9.997 19.995ZM9.997 11.995C9.583 11.995 9.247 11.659 9.247 11.245V5.745C9.247 5.331 9.583 4.995 9.997 4.995C10.411 4.995 10.747 5.331 10.747 5.745V11.245C10.747 11.659 10.411 11.995 9.997 11.995ZM9.995 14.995C9.443 14.995 8.995 14.547 8.995 13.995C8.995 13.443 9.443 12.995 9.995 12.995C10.547 12.995 10.995 13.443 10.995 13.995C10.995 14.547 10.547 14.995 9.995 14.995Z"
          fill="#E94F4F"
        />
      </svg>
    ),
    yellowRoundWarning: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M9.997 19.995C15.515 19.995 19.995 15.515 19.995 9.997C19.995 4.479 15.515 0 9.997 0C4.48 0 0 4.479 0 9.997C0 15.515 4.48 19.995 9.997 19.995ZM9.997 11.995C9.583 11.995 9.247 11.659 9.247 11.245V5.745C9.247 5.331 9.583 4.995 9.997 4.995C10.411 4.995 10.747 5.331 10.747 5.745V11.245C10.747 11.659 10.411 11.995 9.997 11.995ZM9.995 14.995C9.443 14.995 8.995 14.547 8.995 13.995C8.995 13.443 9.443 12.995 9.995 12.995C10.547 12.995 10.995 13.443 10.995 13.995C10.995 14.547 10.547 14.995 9.995 14.995Z"
          fill="#EFC107"
        />
      </svg>
    ),
  };

  const iconElement = icons[name];

  if (!iconElement) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return (
    <span
      className={className}
      style={{
        width: size,
        height: size,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      {...props}
    >
      {iconElement}
    </span>
  );
}
