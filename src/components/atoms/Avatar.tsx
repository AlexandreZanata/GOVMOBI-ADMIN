"use client";

import { useState } from "react";

/** Avatar size scale */
export type AvatarSize = "sm" | "md" | "lg";

export interface AvatarProps {
  /** Full name used to derive initials fallback */
  name: string;
  /** Optional image URL */
  src?: string;
  /** Size scale */
  size?: AvatarSize;
  /** Test selector */
  "data-testid"?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
};

/**
 * Derives up to two initials from a full name string.
 * @param name - Full name (e.g. "Jane Doe")
 * @returns Uppercase initials (e.g. "JD")
 */
function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * GovMobile avatar with image + initials fallback.
 *
 * @param name - Full name for initials and aria-label
 * @param src - Optional image source URL
 * @param size - Size scale (default: "md")
 * @returns Circular avatar element
 */
export function Avatar({
  name,
  src,
  size = "md",
  "data-testid": testId,
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const showImage = !!src && !imgError;

  return (
    <span
      data-testid={testId}
      role="img"
      aria-label={name}
      className={[
        "inline-flex items-center justify-center rounded-full font-semibold select-none",
        "bg-brand-secondary text-white",
        sizeClasses[size],
      ].join(" ")}
    >
      {showImage ? (
        <img
          src={src}
          alt={name}
          onError={() => setImgError(true)}
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        getInitials(name)
      )}
    </span>
  );
}
