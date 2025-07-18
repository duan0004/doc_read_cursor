import React from "react";

export default function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="inline align-middle"
    >
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38bdf8" />
          <stop offset="1" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="22" stroke="url(#g1)" strokeWidth="4" fill="white" fillOpacity={0.9} />
      <rect x="14" y="14" width="20" height="20" rx="4" fill="#fff" stroke="#a78bfa" strokeWidth="2" />
      <rect x="18" y="18" width="12" height="2.5" rx="1.2" fill="#a78bfa" opacity="0.7" />
      <rect x="18" y="22" width="12" height="2.5" rx="1.2" fill="#38bdf8" opacity="0.7" />
      <rect x="18" y="26" width="8" height="2.5" rx="1.2" fill="#a78bfa" opacity="0.5" />
      <circle cx="24" cy="34" r="3" fill="#38bdf8" stroke="#a78bfa" strokeWidth="1.5" />
      <rect x="22.5" y="31.5" width="3" height="5" rx="1.2" fill="#fff" opacity="0.7" />
    </svg>
  );
} 