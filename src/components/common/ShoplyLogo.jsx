import React, { useId } from 'react';

/**
 * ShoplyLogoMark - The official vector emblem for Shoply.
 * Represents an iconic shopping tote with an elegant monogram 'S' 
 * and a signature golden sparkle signifying verified quality and speed.
 */
export const ShoplyLogoMark = ({ className = "w-10 h-10 sm:w-11 sm:h-11", animated = true }) => {
  const id = useId().replace(/:/g, '');
  const bgGradId = `shoply-bg-${id}`;
  const goldGradId = `shoply-gold-${id}`;
  const whiteGradId = `shoply-white-${id}`;

  return (
    <div
      className={`relative shrink-0 flex items-center justify-center rounded-2xl shadow-md overflow-hidden ${
        animated ? 'transition-transform duration-300 group-hover:scale-105 group-hover:shadow-lg' : ''
      } ${className}`}
    >
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          {/* Deep Navy/Sapphire Background Gradient */}
          <linearGradient id={bgGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#091124" />
            <stop offset="45%" stopColor="#142647" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>

          {/* Luxury Champagne/Amber Gold Accent Gradient */}
          <linearGradient id={goldGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="35%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>

          {/* Crisp Platinum White Gradient for the 'S' */}
          <linearGradient id={whiteGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>
        </defs>

        {/* Base Squircle Container */}
        <rect x="1" y="1" width="46" height="46" rx="13" fill={`url(#${bgGradId})`} />
        <rect
          x="1"
          y="1"
          width="46"
          height="46"
          rx="13"
          fill="none"
          stroke="#60a5fa"
          strokeOpacity="0.35"
          strokeWidth="1.2"
        />

        {/* Subtle Sapphire Ambient Glow */}
        <circle cx="24" cy="28" r="15" fill="#3b82f6" fillOpacity="0.18" />

        {/* Golden Metallic Shopping Bag Handle */}
        <path
          d="M18.5 17.5 C18.5 11.5, 29.5 11.5, 29.5 17.5"
          fill="none"
          stroke={`url(#${goldGradId})`}
          strokeWidth="2.6"
          strokeLinecap="round"
        />

        {/* Sleek Shopping Bag Silhouette */}
        <path
          d="M13.5 17.5 H34.5 L36.2 37.8 C36.4 39.5 35 41 33.2 41 H14.8 C13 41 11.6 39.5 11.8 37.8 Z"
          fill="#0a1226"
          fillOpacity="0.55"
          stroke="#93c5fd"
          strokeOpacity="0.3"
          strokeWidth="1"
        />

        {/* Bespoke Geometric 'S' Monogram Ribbon */}
        <path
          d="M28.8 23.8 C27.4 22.2 25.6 21.4 23.5 21.4 C20.4 21.4 18.5 23 18.5 25.2 C18.5 27.6 20.6 28.7 23.8 29.6 C27.5 30.6 29.5 31.8 29.5 34.2 C29.5 36.8 27.3 38.4 23.8 38.4 C21.2 38.4 19.2 37.3 17.8 35.6"
          fill="none"
          stroke={`url(#${whiteGradId})`}
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 4-Point Gold Star Sparkle */}
        <path
          d="M36.5 10.5 C36.5 12.6 37.6 13.8 39.5 13.8 C37.6 13.8 36.5 15 36.5 17.1 C36.5 15 35.4 13.8 33.5 13.8 C35.4 13.8 36.5 12.6 36.5 10.5 Z"
          fill={`url(#${goldGradId})`}
        />
      </svg>
    </div>
  );
};

/**
 * ShoplyLogo - Full brand lockup with vector emblem, wordmark, and optional sub-tagline.
 */
export const ShoplyLogo = ({
  size = "md",
  showTagline = true,
  className = "",
  animated = true,
}) => {
  const sizeMap = {
    sm: {
      mark: "w-8 h-8",
      text: "text-lg",
      tagline: "text-[7px] tracking-[0.16em]",
      gap: "gap-2",
    },
    md: {
      mark: "w-9 h-9 sm:w-10 sm:h-10",
      text: "text-xl sm:text-2xl",
      tagline: "text-[8px] sm:text-[9px] tracking-[0.18em]",
      gap: "gap-2.5",
    },
    lg: {
      mark: "w-11 h-11 sm:w-12 sm:h-12",
      text: "text-2xl sm:text-3xl",
      tagline: "text-[9px] sm:text-[10px] tracking-[0.22em]",
      gap: "gap-3 sm:gap-3.5",
    },
    xl: {
      mark: "w-14 h-14 sm:w-16 sm:h-16",
      text: "text-3xl sm:text-4xl",
      tagline: "text-xs tracking-[0.25em]",
      gap: "gap-4",
    },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex items-center ${currentSize.gap} group ${className}`}>
      <ShoplyLogoMark className={currentSize.mark} animated={animated} />
      <div className="flex flex-col justify-center">
        <span
          className={`font-black ${currentSize.text} tracking-tight text-zinc-950 dark:text-white leading-none`}
        >
          Shoply
        </span>
        {showTagline && (
          <span
            className={`font-extrabold ${currentSize.tagline} text-amber-600 dark:text-amber-400 uppercase leading-none mt-1 select-none`}
          >
            EVERYTHING STORE
          </span>
        )}
      </div>
    </div>
  );
};

export default ShoplyLogo;
