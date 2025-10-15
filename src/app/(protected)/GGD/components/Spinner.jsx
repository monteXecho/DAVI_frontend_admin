import React from "react";

export default function Spinner({
  size = 24,
  strokeWidth = 2,
  className,
  label = "Loading…",
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={className}
    >
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <g>
          <path d="M21 12a9 9 0 11-6.219-8.56" />
          {/* Smooth infinite rotation around the center (12,12) */}
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 12 12"
            to="360 12 12"
            dur="0.8s"
            repeatCount="indefinite"
          />
        </g>
      </svg>
      <span
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: "hidden",
          clip: "rect(0,0,0,0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        {label}
      </span>
    </div>
  );
}
