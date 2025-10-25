import React from 'react';

type IconProps = {
  className?: string;
};

export const LassoIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* main lasso loop */}
    <path d="M6 12c0-3.866 3.134-7 7-7s7 3.134 7 7-3.134 7-7 7-7-3.134-7-7z" />

    {/* rope tail (twisted-looking double-line) */}
    <path d="M17.5 16.5c1 1.25 2.2 2.5 3 3.5" strokeWidth="1.6" />
    <path d="M16.6 15.1c1 1 2 1.9 2.8 2.6" strokeWidth="0.9" opacity="0.9" />

    {/* subtle textured strokes along the loop to imply rope fiber */}
    <path
      d="M8.2 8.2c.8-.6 3.2-1.2 4.8-1 1.6.2 3.6 1 4.4 2"
      strokeWidth="0.9"
      strokeDasharray="0.7 2"
      strokeLinecap="round"
    />
    <path
      d="M9 15.5c.5.6 2 1.2 3.5 1.2 1.5 0 3.4-.5 4.2-1.4"
      strokeWidth="0.9"
      strokeDasharray="0.7 2"
      strokeLinecap="round"
    />

    {/* dollar sign centered in the loop; filled so it looks solid (caught) */}
    <g transform="translate(0,0)">
      <text
        x="12"
        y="12.5"
        textAnchor="middle"
        fontSize="7.5"
        fontWeight="700"
        fill="currentColor"
        style={{ fontFamily: 'Arial, Helvetica, sans-serif', dominantBaseline: 'middle' }}
      >
        $
      </text>
    </g>
  </svg>
);

export default LassoIcon;