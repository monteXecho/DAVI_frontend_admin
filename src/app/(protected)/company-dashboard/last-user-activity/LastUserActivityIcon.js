/** Person + lightning — dashboard tile (matches company design system #23BD92) */
export default function LastUserActivityIcon({ className = '' }) {
  return (
    <svg
      className={className}
      width="32"
      height="37"
      viewBox="0 0 32 37"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <g clipPath="url(#clipLastUserActivityTile)">
        <path
          d="M11 12.833C14.544 12.833 17.417 9.96 17.417 6.417C17.417 2.873 14.544 0 11 0C7.45601 0 4.58301 2.873 4.58301 6.417C4.58301 9.96 7.45601 12.833 11 12.833Z"
          fill="#23BD92"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8.937 26.766H1.283C0.55 26.4 0 25.3 0 23.833V22C0 17.416 3.85 14.85 6.6 14.85H15.4C16.425 14.85 17.603 15.206 18.678 15.891L8.937 26.766Z"
          fill="#23BD92"
        />
        <path
          d="M17.2498 36.2559L20.3748 26.8809H10.9998L25.5838 11.2559L22.4588 20.6309H31.8338L17.2498 36.2559Z"
          fill="#23BD92"
        />
      </g>
      <defs>
        <clipPath id="clipLastUserActivityTile">
          <rect width="32" height="37" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
